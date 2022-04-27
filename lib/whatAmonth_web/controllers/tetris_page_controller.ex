defmodule WhatAmonthWeb.TetrisPageController do
  use WhatAmonthWeb, :controller

  plug :put_view, WhatAmonthWeb.MonthPageView

  defp getCtx() do
    %{
      description: "Tetris",
      rootButtonText: "Back to main page",
      title: "Tetris game",
      divClass: "js-tetris"
    }
  end 
  

  def index(conn, _params) do
    render(conn, "random.html", getCtx())
  end
end