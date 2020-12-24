defmodule WhatAmonthWeb.MainPageController do
  use WhatAmonthWeb, :controller

  plug :put_layout, { WhatAmonthWeb.MainLayoutView, "main.html" }

  def index(conn, _param) do
    render(conn, "index.html")
  end
end