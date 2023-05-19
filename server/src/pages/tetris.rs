use actix_web::{get, web, HttpRequest, HttpResponse, Result};
use tera::Context;
use serde::{Deserialize, Serialize};

use super::utils;
use crate::app::AppCtx;
use crate::db::query;

#[derive(Debug, Serialize, Deserialize)]
pub struct TestSqlResult {
    name: String,
    date: String
}

#[get("/tetris")]
pub async fn tetris_page_handler(
    app_ctx: web::Data<AppCtx>,
    req: HttpRequest
) -> Result<HttpResponse> {
    let mut ctx = Context::new();
    let query_result = query(app_ctx).await;
    for res in query_result {
        ctx.insert("result", &format!("{:?}", res));
    }

    return utils::render(req, "tetris.html", &ctx).await;
}
