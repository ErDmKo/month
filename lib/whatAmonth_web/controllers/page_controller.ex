defmodule WhatAmonthWeb.PageController do
  use WhatAmonthWeb, :controller
  use Timex

  def month(conn, %{"id" => id}) do
    no = Integer.parse(id)
    case no do
      {monthNo, ""} when monthNo < 13 and monthNo >=1 ->
        render(conn, "index.html", %{
          month: monthNo
        })
      _ -> conn
        |> put_status(:not_found)
        |> put_view(WhatAmonthWeb.ErrorView)
        |> render(:"404")
    end
  end

  def index(conn, _param) do
    render(conn, "index.html", %{
      isIndex: true,
      month: Timex.today().month
    })
  end
end
