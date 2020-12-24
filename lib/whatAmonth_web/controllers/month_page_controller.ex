defmodule WhatAmonthWeb.MonthPageController do
  use WhatAmonthWeb, :controller
  use Timex

  def month(conn, %{"id" => id}) do
    no = Integer.parse(id)
    case no do
      {monthNo, ""} when monthNo < 13 and monthNo >=1 ->
        nowDate = Timex.now()
        year = if nowDate.month > monthNo, do: nowDate.year + 1, else: nowDate.year
        date = Timex.DateTime.Helpers.construct({year, monthNo, 1}, nowDate.time_zone)
        render(conn, "index.html", %{
          month: monthNo,
          year: year,
          days: Timex.days_in_month(date)
        })
      _ -> conn
        |> put_status(:not_found)
        |> put_view(WhatAmonthWeb.ErrorView)
        |> render(:"404")
    end
  end

  def index(conn, _param) do
    date = Timex.today()
    render(conn, "index.html", %{
      isIndex: true,
      month: date.month,
      year: date.year,
      days: Timex.days_in_month(date)
    })
  end
end
