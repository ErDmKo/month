use actix_web::HttpRequest;
use actix_web::{get, Responder};
use serde::Serialize;
use tera::Context;

use super::utils;

#[derive(Serialize)]
struct MainPageLink {
    name: &'static str,
    href: &'static str,
    text: &'static str,
}

impl MainPageLink {
    fn to_string_link(&self) -> MainPageLinkString {
        MainPageLinkString {
            name: self.name.to_string(),
            href: self.href.to_string(),
            text: self.text.to_string(),
        }
    }
}

#[derive(Serialize)]
struct MainPageContext {
    addreses: Vec<MainPageLink>,
    tools: Vec<MainPageLink>,
    games: Vec<MainPageLink>,
}

#[derive(Serialize)]
struct MainPageLinkString {
    name: String,
    href: String,
    text: String,
}

#[derive(Serialize)]
struct MainPageContextString {
    // domain: String, analytics
    addreses: Vec<MainPageLinkString>,
    tools: Vec<MainPageLinkString>,
    games: Vec<MainPageLinkString>,
}

fn str_to_string_ctx(ctx: MainPageContext) -> MainPageContextString {
    let mut addreses = Vec::new();
    let mut tools = Vec::new();
    let mut games = Vec::new();
    for entry in ctx.addreses {
        addreses.push(entry.to_string_link());
    }
    let domain = String::from(option_env!("DOMAIN").unwrap_or("erdmko.de"));
    addreses.push(MainPageLinkString {
        name: String::from("Blog"),
        href: format!("https://{}/blog", domain),
        text: format!("//{}/blog", domain),
    });
    for entry in ctx.tools {
        tools.push(entry.to_string_link());
    }
    for entry in ctx.games {
        games.push(entry.to_string_link());
    }
    MainPageContextString {
        // domain,
        addreses,
        tools,
        games,
    }
}

fn get_page_ctx() -> MainPageContext {
    let page_info: MainPageContext = MainPageContext {
        addreses: vec![
            MainPageLink {
                name: "Email",
                href: "mailto:erdmko@gmail.com",
                text: "erdmko@gmail.com",
            },
            MainPageLink {
                name: "Telegram",
                href: "https://t.me/erdmko",
                text: "//t.me/erdmko",
            },
            MainPageLink {
                name: "GitHub",
                href: "https://github.com/ErDmKo",
                text: "//github.com/ErDmKo",
            },
            MainPageLink {
                name: "LinkedIn",
                href: "https://www.linkedin.com/in/erdmko/",
                text: "//www.linkedin.com/in/erdmko/",
            },
            MainPageLink {
                name: "Zen",
                href: "https://zen.yandex.ru/id/5a8ed6eddcaf8e23b97cf564",
                text: "//zen.yandex.ru/id/5a8ed6eddcaf8e23b97cf564",
            },
            MainPageLink {
                name: "Twitter",
                href: "https://twitter.com/ErDmKo",
                text: "//twitter.com/ErDmKo",
            },
        ],
        tools: vec![
            MainPageLink {
                name: "Base64 ecoder/decoder",
                href: "/base64",
                text: "base64",
            },
            MainPageLink {
                name: "Random generator",
                href: "/random",
                text: "Random",
            },
            MainPageLink {
                name: "Months names",
                href: "/month",
                text: "Month",
            },
            MainPageLink {
                name: "Slug generator",
                href: "/slugify",
                text: "Slugify",
            },
        ],
        games: vec![MainPageLink {
            name: "Tetris game",
            href: "/tetris",
            text: "tetris",
        }],
    };
    page_info
}

#[get("/")]
pub async fn main_page_handler(req: HttpRequest) -> impl Responder {
    let page_ctx = get_page_ctx();
    let ctx = Context::from_serialize(str_to_string_ctx(page_ctx)).unwrap();
    return utils::render(req, "main.html", &ctx).await;
}
