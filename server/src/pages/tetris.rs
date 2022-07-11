use super::utils;
use actix_web::{get, HttpRequest, Responder};
use tera::Context;

#[get("/tetris")]
pub async fn tetris_page_handler(req: HttpRequest) -> impl Responder {
    let mut ctx = Context::new();
    ctx.insert("result", &1023);
    return utils::render(req, "tetris.html", &ctx).await;
}
