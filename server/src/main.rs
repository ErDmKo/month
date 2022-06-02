use actix_files as fs;
use actix_web::{App, HttpServer};
use std::sync::{Arc, RwLock};
use std::{env, fs as ofs};
use std::path::PathBuf;
use tera::Tera;
pub mod pages;

static TEMPLATES_GLOB: &str = "templates/**/*";
static BAZEL_PREFIX: &'static str = env!("IS_BAZEL", "");

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let mut path = PathBuf::from(BAZEL_PREFIX);
    path.push(&TEMPLATES_GLOB);
    let tera = match Tera::new(&path.to_str().unwrap()) {
        Ok(t) => t,
        Err(e) => {
            println!("Parsing error(s): {}", e);
            ::std::process::exit(1);
        }
    };
    let templates = Arc::new(RwLock::new(tera));
    let mut static_path = PathBuf::from(BAZEL_PREFIX);
    if BAZEL_PREFIX != "" {
        static_path.push("..");
        static_path.push("assets");
    }
    HttpServer::new(move || {
        App::new()
            .app_data(templates.clone())
            .service(pages::main_page_handler)
            .service(pages::random_page_handler)
            .service(pages::base64_page_handler)
            .service(fs::Files::new("/static", &static_path)
            .show_files_listing())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
