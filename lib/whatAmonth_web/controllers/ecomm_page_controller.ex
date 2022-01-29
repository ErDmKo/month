defmodule WhatAmonthWeb.EcommPageController do
  use WhatAmonthWeb, :controller

  plug :put_view, WhatAmonthWeb.MonthPageView

  defp getCtx() do
    %{
      description: "Ecomm page",
      rootButtonText: "Back to main page",
      title: "Ecom page",
      random: 0
    }
  end 
  

  def index(conn, _params) do
    render(conn, "ecomm.html", getCtx())
  end
end