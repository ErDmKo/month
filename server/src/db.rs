use std::path::PathBuf;
use log;
use actix_web::{error, web};
use r2d2_sqlite::{self, SqliteConnectionManager};
use rusqlite::types::ValueRef;
use serde::{Deserialize, Serialize};

use crate::app::AppCtx;
use crate::app::Pool;

pub static TABLE_NAME: &'static str = "prompt";

#[derive(Debug, Serialize, Deserialize)]
pub struct SqlResult {
    pub id: i32,
    pub prompt: String,
    pub data: Option<Vec<u8>>,
    // state = 0 - pending execute
    // state = 1 - executing
    // state = 2 - success
    // state = 3 - fail
    pub state: i32,
}

fn init_pool(base_dir: &mut PathBuf) -> Result<Pool, r2d2::Error> {
    base_dir.push("db");
    base_dir.push("main.db");
    log::info!("Db pool start {:?}", base_dir);
    let manager = SqliteConnectionManager::file(base_dir);
    let pool = Pool::new(manager)?;
    Ok(pool)
}

pub async fn init_db(base_dir: &mut PathBuf) -> Result<Pool, rusqlite::Error> {
    log::info!("Init db");
    let drop_query = format!("DROP TABLE IF EXISTS {TABLE_NAME}");
    let pool = init_pool(base_dir).map_err(|e| {
        let error_text = format!("Pool error {e:?}");
        rusqlite::Error::InvalidParameterName(error_text)
    })?;
    let conn = pool.get().unwrap();
    conn.execute(&drop_query, ())?;
    let create_query = format!(
        "CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            id    INTEGER PRIMARY KEY,
            promt  TEXT NOT NULL,
            datetime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            data BLOB,
            state INTEGER DEFAULT 0
        )"
    );
    conn.execute(&create_query, ())?;
    conn.execute(
        format!("INSERT INTO {TABLE_NAME} (promt) VALUES (?1)").as_str(),
        ("1girl, oshi no ko, solo, upper body, v, smile, looking at viewer, outdoors, night",)
    )?;
    Ok(pool)
}
pub async fn insert_promt(
    app_ctx: &web::Data<AppCtx>,
    promt: &String
) -> actix_web::Result<i32> {
    let pool = app_ctx.pool.clone();
    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;
    conn.execute(format!("INSERT into {TABLE_NAME} (promt) VALUES (?1)").as_str(), (promt,))
        .map_err(|e| {
            log::error!("{:?}", e);
            error::ErrorBadRequest("query error")
        })?;
    conn.execute(format!("DELETE FROM {TABLE_NAME}
        WHERE id NOT IN (
            SELECT id
            FROM {TABLE_NAME}
            ORDER BY id DESC
            LIMIT 10
        )"
    ).as_str(), ())
        .map_err(|e| {
            log::error!("{:?}", e);
            error::ErrorBadRequest("query error")
        })?;
    Ok(1)
}

pub async fn insert_status_promt(
    app_ctx: &web::Data<AppCtx>,
    id: &String,
    status: &String
) -> actix_web::Result<i32> {
    let pool = app_ctx.pool.clone();
    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;
    conn.execute(format!(
        "UPDATE {TABLE_NAME} set status=?1 where id=?2").as_str(), (status, id)
    )
        .map_err(|e| {
            log::error!("{:?}", e);
            error::ErrorBadRequest("query error")
        })?;
    Ok(1)
}

pub async fn delete_promt(
    app_ctx: &web::Data<AppCtx>,
    id: &i32
) -> actix_web::Result<i32> {
    let pool = app_ctx.pool.clone();
    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;
    let delete_qury = format!("DELETE from {TABLE_NAME} where id = ?1");
    conn.execute(&delete_qury, (id,))
        .map_err(|e| {
            log::error!("{:?}", e);
            error::ErrorBadRequest("query error")
        })?;
    Ok(*id)
}

pub async fn query_promts(app_ctx: web::Data<AppCtx>) -> actix_web::Result<Vec<SqlResult>> {
    let pool = app_ctx.pool.clone();
    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    let query_result = web::block(move || {
        let query = format!("SELECT id, promt, state, data from {TABLE_NAME} order by datetime desc");
        let mut stmt = conn.prepare(&query)?;
        let r = stmt
            .query_map([], |row| {
                let bytes = row
                    .get_ref("data")?;
                Ok(SqlResult {
                    id: row.get("id")?,
                    prompt: row.get("promt")?,
                    state: row.get("state")?,
                    data: match bytes {
                        ValueRef::Blob(byte) => {
                            Some(byte.to_vec())
                        },
                        _ => None
                    }
                })
            })
            .and_then(Iterator::collect::<Result<Vec<_>, _>>);
        r
    })
    .await?
    .map_err(|e| {
        log::error!("{:?}", e);
        error::ErrorBadRequest("query error")
    })?;

    Ok(query_result)
}
