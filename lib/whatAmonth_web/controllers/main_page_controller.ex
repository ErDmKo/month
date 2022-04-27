defmodule WhatAmonthWeb.MainPageController do
  use WhatAmonthWeb, :controller

  plug :put_layout, { WhatAmonthWeb.MainLayoutView, "main.html" }

  def index(conn, _param) do
    render(conn, "index.html", %{
      links: [%{
          name: "Email",
          href: "mailto:erdmko@gmail.com",
          text: "erdmko@gmail.com"
        },
        %{
          name: "Telegram",
          href: "https://t.me/erdmko",
          text: "//t.me/erdmko"
        },
        %{
          name: "GitHub",
          href: "https://github.com/ErDmKo",
          text: "//github.com/ErDmKo"
        },
        %{
          name: "LinkedIn",
          href: "https://www.linkedin.com/in/erdmko/",
          text: "//www.linkedin.com/in/erdmko/"
        },
        %{
          name: "Zen",
          href: "https://zen.yandex.ru/id/5a8ed6eddcaf8e23b97cf564",
          text: "//zen.yandex.ru/id/5a8ed6eddcaf8e23b97cf564"
        },
        %{
          name: "Twitter",
          href: "https://twitter.com/ErDmKo",
          text: "//twitter.com/ErDmKo"
        },
        %{
          name: "Blog",
          href: "https://erdmko.de/blog",
          text: "//erdmko.de/blog"
        },
      ],
      games: [%{
          name: "Tetris game",
          href: Routes.tetris_page_path(conn, :index),
          text: "Tetris"
      }],
      tools: [%{
          name: "Base64 ecoder/decoder",
          href: Routes.base64_page_path(conn, :index),
          text: "Base64"
        },
        %{
          name: "Random generator",
          href: Routes.random_page_path(conn, :index),
          text: "Random"
        },
        %{
          name: "Ecomm test",
          href: Routes.ecomm_page_path(conn, :index),
          text: "Ecomm"
        }
      ]
    })
  end
end