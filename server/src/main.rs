use actix_files as fs;
use actix_web::{middleware, App, HttpServer};
use std::option_env;
use std::path::PathBuf;
use std::sync::{Arc, RwLock};
use tera::Tera;
pub mod pages;

static TEMPLATES_GLOB: &str = "templates/**/*";
static BAZEL_PREFIX: Option<&'static str> = option_env!("IS_BAZEL");

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let env_path = BAZEL_PREFIX.unwrap_or("");
    let mut path = PathBuf::from(env_path);
    path.push(&TEMPLATES_GLOB);
    let tera = match Tera::new(&path.to_str().unwrap()) {
        Ok(t) => t,
        Err(e) => {
            println!("Parsing error(s): {}", e);
            ::std::process::exit(1);
        }
    };
    let templates = Arc::new(RwLock::new(tera));
    let mut static_path = PathBuf::from(env_path);
    if env_path != "" {
        static_path.push("..");
        static_path.push("assets");
    }

    HttpServer::new(move || {
        App::new()
            .wrap(middleware::NormalizePath::trim())
            .wrap(middleware::Compress::default())
            .app_data(templates.clone())
            .service(pages::main_page_handler)
            .service(pages::random_page_handler)
            .service(pages::base64_page_handler)
            .service(pages::tetris_page_handler)
            .service(pages::month_page_handler)
            .service(pages::month_no_page_handler)
            .service(fs::Files::new("/static", &static_path).show_files_listing())
    })
    .bind(("127.0.0.1", 8080))?
    .run()
    .await
}
