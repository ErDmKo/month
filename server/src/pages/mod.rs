mod base64;
mod main_page;
mod random;
mod tetris;
mod utils;
mod months;
pub use self::base64::base64_page_handler;
pub use self::main_page::main_page_handler;
pub use self::random::random_page_handler;
pub use self::tetris::tetris_page_handler;
pub use self::months::month_page_handler;