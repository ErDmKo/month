use super::utils;
use actix_web::{get, HttpRequest, Responder};
use tera::Context;

#[get("/month")]
async fn month_page_handler(req: HttpRequest) -> impl Responder {
    let mut ctx = Context::new();
    ctx.insert("result", "Month");
    return utils::render(req, "random.html", &ctx).await;
}