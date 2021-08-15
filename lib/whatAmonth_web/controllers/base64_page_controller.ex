defmodule WhatAmonthWeb.Base64PageController do
  use WhatAmonthWeb, :controller

  plug :put_view, WhatAmonthWeb.MonthPageView

  defp getCtx() do
    %{
      description: "Online base 64 decode / encode",
      rootButtonText: "Back to main page",
      title: "Online base 64 convertor",
    }
  end 

  defp getCtx(query) when is_bitstring(query) do
    %{
      description: ~s/Online base 64 convertor #{query}/,
      rootButtonText: "Back to main page",
      title: ~s/Online base 64 convertor #{query}/,
    }
  end 

  def index(conn, %{"action" => "decode", "encodeQuery" => query}) do
    ctx = getCtx(query)
    ctx = with {:ok, result} <- Base.decode64(query) do
      Map.put(ctx, :text, result)
    else
      _ -> Map.put(ctx, :text, "Error")

    end

    render(conn, "base64.html", ctx)
  end

  def index(conn, %{"action" => "encode", "encodeQuery" => query}) do
    ctx = getCtx(query)
    ctx = Map.put(ctx, :text, Base.encode64(query))
    render(conn, "base64.html", ctx)
  end

  def index(conn, _params) do
    render(conn, "base64.html", getCtx())
  end
end