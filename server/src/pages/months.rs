use super::utils;
use actix_web::{web, get, HttpRequest, Responder};
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

#[get("/month/{number}")]
async fn month_no_page_handler(req: HttpRequest, no: web::Path<String>) -> impl Responder {
    let mut ctx = Context::new();
    let months = get_months();
    let no_string = no.to_string();
    if let Ok(no_num) = no_string.parse::<usize>() {
        let val = months.get(no_num - 1);
        if val.is_some() {
            ctx.insert("current", val.unwrap());
            ctx.insert("current_no", &no_string);
        }
    }
    ctx.insert("months", &months);
    return utils::render(req, "months.html", &ctx).await;
}

#[get("/month")]
async fn month_page_handler(req: HttpRequest) -> impl Responder {
    let mut ctx = Context::new();
    ctx.insert("months", &get_months());
    return utils::render(req, "months.html", &ctx).await;
}
