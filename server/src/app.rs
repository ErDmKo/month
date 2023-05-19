use std::path::PathBuf;
pub type Pool = r2d2::Pool<r2d2_sqlite::SqliteConnectionManager>;

pub struct AppCtx {
    pub static_path: PathBuf,
    pub pool: Pool,
}
