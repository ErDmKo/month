defmodule WhatAmonthWeb.RandomPageController do
  use WhatAmonthWeb, :controller

  plug :put_view, WhatAmonthWeb.MonthPageView

  defp getCtx() do
    %{
      description: "Random generator",
      rootButtonText: "Back to main page",
      title: "Random generator",
      random: :rand.uniform(1_000_000_000)
    }
  end

  def index(conn, _params) do
    render(conn, "random.html", getCtx())
  end
end
