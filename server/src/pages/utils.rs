use actix_web::{HttpRequest, HttpResponse, Responder};
use std::sync::{Arc, RwLock};
use tera::{Context, Tera};

pub async fn render(req: HttpRequest, template: &str, ctx: &Context) -> impl Responder {
    let data: Option<&Arc<RwLock<Tera>>> = req.app_data();
    if let Some(eng) = data {
        let engine = eng.read().unwrap();
        let body = engine.render(template, &ctx);
        return match body {
            Ok(v) => HttpResponse::Ok().body(v),
            Err(e) => {
                println!("Template error {:?}", e);
                HttpResponse::BadRequest().body("Template error")
            }
        };
    }
    HttpResponse::BadRequest().body("Error")
}
