use actix_web::{get, web, HttpRequest, Responder};
use log::info;
use serde_json::json;
use std::time::Duration;
use base64::{decode, encode};
use serde::{Deserialize, Serialize};
use tera::Context;
use awc::Client;
use std::option_env;

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

#[derive(Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
enum ImageActions {
    Generate,
}
#[derive(Deserialize, Serialize)]
struct ImageParams {
    result: Option<String>,
    query: Option<String>,
    action: Option<ImageActions>,
}

static TOKEN: Option<&'static str> = option_env!("API_TOKEN");

#[get("/image")]
async fn image_page_handler(req: HttpRequest, info: web::Query<ImageParams>) -> impl Responder {
    let ref mut query_params = info.into_inner();
    let mut ctx = Context::new();
    ctx.insert("query", &query_params.query);
    let client = Client::default();
    let token: Result<&str, &str> = match TOKEN {
        Some("") => Err("No token"),
        None => Err("No token"),
        Some(val) => Ok(val)
    };
    if token.is_err() {
        info!("No token");
        return utils::render(req, "image.html", &ctx).await;
    }

    let request = client
        .post("https://api-inference.huggingface.co/models/cagliostrolab/animagine-xl-3.0")
        .append_header(("Authorization", format!("Bearer {}", token.unwrap())));

    match &query_params.query {
        Some(user_query) => {
            let response = request
                .timeout(Duration::new(60, 0))
                .send_json(&json!({
                    "inputs": user_query.clone()
                })).await;
            info!("Response: {:#?}", response);
            match response {
                Ok(mut resp) => {
                    let body = resp.body().await?;
                    let encoded_string = encode(body);
                    ctx.insert("result", &encoded_string);
                }
                Err(_) => {
                    ()
                }
            }
        }
        None => ()
    }

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
