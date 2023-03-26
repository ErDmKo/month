use actix_files;
use actix_web::{middleware, App, HttpServer};
use std::{option_env, env};
use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use tera::Tera;
use env_logger;
use log::info;
pub mod pages;

static TEMPLATES_GLOB: &str = "templates/**/*";
static BASE_PATH: Option<&'static str> = option_env!("BASE_PATH");
static BAZEL_STATIC: Option<&'static str> = option_env!("BAZEL_STATIC");
static HOST_RUN: Option<&'static str> = option_env!("HOST");
static PORT_RUN: Option<&'static str> = option_env!("PORT");


#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));
    let current_dir = env::current_dir().unwrap();
    let current_dir_str = current_dir.to_str().unwrap();
    info!("Starting http server from  directory '{}'", &current_dir_str);
    let base_path = BASE_PATH.unwrap_or(&current_dir_str);
    let mut static_path = PathBuf::from(&base_path);
    let mut templates_path = PathBuf::from(&base_path);
    match BAZEL_STATIC {
        Some(bazel_path) => {
            info!("Is bazel build info - '{}'", bazel_path);
            static_path.push("assets");
            templates_path.push(bazel_path)
        },
        None => static_path.push("static")
    }
    info!("Static path '{:?}'", static_path);
    templates_path.push(&TEMPLATES_GLOB);
    let host = HOST_RUN.unwrap_or("127.0.0.1");
    let port_str = PORT_RUN.unwrap_or("8080");
    let port = port_str.parse::<u16>().unwrap();
    let tera_path = &templates_path.to_str().unwrap();
    info!("Templates start {:?}", tera_path);
    let tera = Tera::new(tera_path).unwrap();
    info!("Templates done");
    let templates = Arc::new(RwLock::new(tera));
    info!("Srating server host '{}' port '{}'", host, port);
    HttpServer::new(move || {
        App::new()
            .wrap(middleware::NormalizePath::trim())
            .wrap(middleware::Compress::default())
            .wrap(middleware::Logger::default())
            .app_data(templates.clone())
            .service(pages::main_page_handler)
            .service(pages::random_page_handler)
            .service(pages::base64_page_handler)
            .service(pages::tetris_page_handler)
            .service(pages::month_page_handler)
            .service(pages::month_no_page_handler)
            .service(pages::slugify_page_handler)
            .service(actix_files::Files::new("/static", &static_path).show_files_listing())
    })
    .bind((host, port))?
    .run()
    .await
}
