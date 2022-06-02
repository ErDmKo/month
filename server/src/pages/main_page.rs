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

#[derive(Serialize)]
struct MainPageContext {
    addreses: [MainPageLink; 7],
    tools: [MainPageLink; 2],
    games: [MainPageLink; 1],
}

static PAGE_INFO: MainPageContext = MainPageContext {
    addreses: [
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
        MainPageLink {
            name: "Blog",
            href: "https://erdmko.de/blog",
            text: "//erdmko.de/blog",
        },
    ],
    tools: [
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
    ],
    games: [MainPageLink {
        name: "Tetris game",
        href: "/tetris",
        text: "tetris",
    }],
};

#[get("/")]
pub async fn main_page_handler(req: HttpRequest) -> impl Responder {
    let ctx = &Context::from_serialize(&PAGE_INFO).unwrap();
    return utils::render(req, "main.html", &ctx).await;
}
