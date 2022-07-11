use super::utils;
use actix_web::{get, HttpRequest, Responder};
use tera::Context;

fn get_months() -> Vec<&'static str> {
    vec![
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
    ]
}

#[get("/month")]
async fn month_page_handler(req: HttpRequest) -> impl Responder {
    let mut ctx = Context::new();
    ctx.insert("months", &get_months());
    return utils::render(req, "months.html", &ctx).await;
}
