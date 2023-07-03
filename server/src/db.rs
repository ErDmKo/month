use std::path::PathBuf;

use actix_web::{error, web};
use log::info;
use r2d2_sqlite::{self, SqliteConnectionManager};
use serde::{Deserialize, Serialize};

use crate::app::AppCtx;
use crate::app::Pool;

pub static TABLE_NAME: &'static str = "afisha";

#[derive(Debug, Serialize, Deserialize)]
pub struct TestSqlResult {
    name: String,
    date: String,
}

fn init_pool(base_dir: &mut PathBuf) -> Result<Pool, r2d2::Error> {
    base_dir.push("db");
    base_dir.push("main.db");
    info!("Db pool start {:?}", base_dir);
    let manager = SqliteConnectionManager::file(base_dir);
    let pool = Pool::new(manager)?;
    Ok(pool)
}

pub async fn init_db(base_dir: &mut PathBuf) -> Result<Pool, rusqlite::Error> {
    info!("Init db");
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
            name  TEXT NOT NULL,
            date  TEXT NOT NULL
            )"
    );
    conn.execute(&create_query, ())?;
    conn.execute(
        "INSERT INTO afisha (name, date) VALUES (?1, ?2)",
        ("Stockholm // Solo show in Russian", "2023-05-20T20:00:30"),
    )?;
    Ok(pool)
}

pub async fn query(app_ctx: web::Data<AppCtx>) -> actix_web::Result<Vec<TestSqlResult>> {
    let pool = app_ctx.pool.clone();
    let conn = web::block(move || pool.get())
        .await?
        .map_err(error::ErrorInternalServerError)?;

    let query_result = web::block(move || {
        let query = format!("SELECT name, date from {TABLE_NAME}");
        let mut stmt = conn.prepare(&query)?;
        let r = stmt
            .query_map([], |row| {
                Ok(TestSqlResult {
                    name: row.get(0)?,
                    date: row.get(1)?,
                })
            })
            .and_then(Iterator::collect::<Result<Vec<_>, _>>);
        r
    })
    .await?
    .map_err(|_| error::ErrorBadRequest("query error"))?;

    Ok(query_result)
}
