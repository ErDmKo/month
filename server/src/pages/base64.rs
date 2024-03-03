use actix_web::http::StatusCode;
use actix_web::web::Redirect;
use actix_web::{get, post, web, Result, HttpRequest, Responder};
use base64::{decode, encode};
use serde::{Deserialize, Serialize};
use tera::Context;
use crate::db::{query_promts, delete_promt, insert_promt};
use crate::app::AppCtx;

use super::utils;

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
enum Actions {
    Encode,
    Decode,
}
#[derive(Deserialize, Serialize)]
struct Base64Params {
    result: Option<String>,
    query: Option<String>,
    action: Option<Actions>,
}

#[derive(Deserialize, Serialize, Debug)]
#[serde(rename_all = "lowercase")]
enum ImageActions {
    Generate,
}
#[derive(Deserialize, Serialize, Debug)]
struct ImageParams {
    id: Option<String>,
    status: Option<String>,
    error: Option<String>,
    promt: Option<String>,
    delete: Option<i32>,
    data: Option<Vec<u8>>,
    token: Option<String>
}

#[derive(Deserialize, Serialize, Debug)]
struct Task {
    id: i32,
    state: i32,
    prompt: String,
    image: Option<String>
}

#[derive(Deserialize, Serialize, Debug)]
struct JSONError {
    error: String
}

// static TOKEN: Option<&'static str> = option_env!("API_TOKEN");

#[post("/image")]
async fn post_image_page_handler(
    app_ctx: web::Data<AppCtx>,
    info: web::Form<ImageParams>
) -> Result<impl Responder> {
    let ref mut query_params = info.into_inner();
    if let Some(id) = &query_params.delete {
        let query_result = delete_promt(&app_ctx, id).await?;
        log::info!("{:#?}", query_result);
    }

    match query_params.promt.as_deref() {
        Some("") => (),
        None => (),
        Some(promt) => {
            let query_result = insert_promt(&app_ctx, &String::from(promt)).await?;
            log::info!("{:#?}", query_result);
        }
    }

    Result::Ok(
        Redirect::to("/image")
        .using_status_code(StatusCode::FOUND)
    )
}


#[get("/image")]
async fn image_page_handler(
    app_ctx: web::Data<AppCtx>,
    req: HttpRequest,
) -> impl Responder {
    let mut ctx = Context::new();
    let query_result = query_promts(app_ctx).await?;
    let tasks = query_result.into_iter().map(|row| {
        Task {
            id: row.id,
            prompt: row.prompt,
            state: row.state,
            image: match row.data {
                Some(bytes) => Some(format!("data:image/jpg;base64,{}", encode(bytes))),
                _ => None
            }
        }
    }).collect::<Vec<_>>();
    ctx.insert("prompts", &tasks);
    return utils::render(req, "image.html", &ctx).await;
}

#[get("/base64")]
async fn base64_page_handler(req: HttpRequest, info: web::Query<Base64Params>) -> impl Responder {
    let ref mut query_params = info.into_inner();
    match &query_params.query {
        None => Some(String::from("")),
        Some(query_val) => {
            let string_result: Option<String> = match &query_params.action {
                Some(Actions::Decode) => {
                    let mut is_ok = true;
                    let decoded_bytes = decode(query_val).unwrap_or_else(|_| {
                        is_ok = false;
                        vec![0]
                    });
                    let decoded_str = String::from_utf8(decoded_bytes).unwrap_or_else(|_| {
                        is_ok = false;
                        String::from("")
                    });
                    Some(if is_ok {
                        decoded_str
                    } else {
                        String::from("Wrong value")
                    })
                }
                Some(Actions::Encode) => {
                    let encoded_string = encode(query_val);
                    Some(encoded_string)
                }
                None => None,
            };
            query_params.result = string_result;
            None
        }
    };
    let ctx = &Context::from_serialize(&query_params).unwrap();
    return utils::render(req, "base64.html", &ctx).await;
}
