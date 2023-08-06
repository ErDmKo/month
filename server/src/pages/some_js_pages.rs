use actix_web::{get, web, HttpRequest, HttpResponse, Result};
use tera::Context;

use super::utils;
use crate::app::AppCtx;
use crate::db::query;

#[get("/tetris")]
pub async fn tetris_page_handler(
    app_ctx: web::Data<AppCtx>,
    req: HttpRequest,
) -> Result<HttpResponse> {
    let mut ctx = Context::new();
    ctx.insert("game_name", "Tetris");
    ctx.insert("bundle_name", "tetris");
    let query_result = query(app_ctx).await;
    if let Ok(res) = &query_result {
        ctx.insert("result", &format!("{:?}", res));
    }
    return utils::render(req, "js_bundle_page.html", &ctx).await;
}

#[get("/tennis")]
pub async fn tennis_page_handler(
    req: HttpRequest,
) -> Result<HttpResponse> {
    let mut ctx = Context::new();
    ctx.insert("game_name", "Tennis");
    ctx.insert("bundle_name", "tennis");
    return utils::render(req, "js_bundle_page.html", &ctx).await;
}
