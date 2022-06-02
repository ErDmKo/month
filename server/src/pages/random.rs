use super::utils;
use actix_web::{get, HttpRequest, Responder};
use rand::random;
use tera::Context;

#[get("/random")]
pub async fn random_page_handler(req: HttpRequest) -> impl Responder {
    let mut ctx = Context::new();
    let val: u64 = random();
    ctx.insert("result", &val);
    return utils::render(req, "random.html", &ctx).await;
}
