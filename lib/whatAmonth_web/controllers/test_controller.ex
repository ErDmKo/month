defmodule WhatAmonthWeb.TestPageController do
  use WhatAmonthWeb, :controller

  plug :put_view, WhatAmonthWeb.MonthPageView

  defp processChunk(conn, list) do
    conn = Plug.Conn.send_chunked(conn, 200)
    Enum.reduce_while(Enum.with_index(list), conn, fn ({chunk}, conn) ->
        :timer.sleep(500);
        case Plug.Conn.chunk(conn, chunk) do
          {:ok, conn} -> {:cont, conn}
          {:error, :closed} -> {:halt, conn}
        end; 
      end)
  end

  def index(conn, _params) do
    format = get_format(conn)
    template = template_name("base64.html", format)
    view =
      Map.get(conn.private, :phoenix_view) ||
        raise "a view module was not specified, set one with put_view/2"

    conn = prepare_assigns(conn, %{}, template, format)
    conn = ensure_resp_content_type(conn, MIME.type(format))
    data = render_with_layouts(conn, view, template, format)
    processChunk(conn, data)
  end

  defp ensure_resp_content_type(%Plug.Conn{resp_headers: resp_headers} = conn, content_type) do
    if List.keyfind(resp_headers, "content-type", 0) do
      conn
    else
      content_type = content_type <> "; charset=utf-8"
      %Plug.Conn{conn | resp_headers: [{"content-type", content_type}|resp_headers]}
    end
  end

  defp render_with_layouts(conn, view, template, format) do
    render_assigns = Map.put(conn.assigns, :conn, conn)

    case root_layout(conn) do
      {layout_mod, layout_tpl} ->
        inner = Phoenix.View.render(view, template, render_assigns)
        root_assigns = render_assigns |> Map.put(:inner_content, inner) |> Map.delete(:layout)
        Phoenix.View.render_to_iodata(layout_mod, template_name(layout_tpl, format), root_assigns)

      false ->
        Phoenix.View.render_to_iodata(view, template, render_assigns)
    end
  end

  defp layout(conn, assigns, format) do
    if format in layout_formats(conn) do
      case Map.fetch(assigns, :layout) do
        {:ok, layout} -> layout
        :error -> layout(conn)
      end
    else
      false
    end
  end

  defp to_map(assigns) when is_map(assigns), do: assigns
  defp to_map(assigns) when is_list(assigns), do: :maps.from_list(assigns)

  defp prepare_assigns(conn, assigns, template, format) do
    assigns = to_map(assigns)
    layout =
      case layout(conn, assigns, format) do
        {mod, layout} -> {mod, template_name(layout, format)}
        false -> false
      end

    conn
    |> put_private(:phoenix_template, template)
    |> Map.update!(:assigns, fn prev ->
      prev
      |> Map.merge(assigns)
      |> Map.put(:layout, layout)
    end)
  end

  defp template_name(name, format) when is_atom(name), do:
    Atom.to_string(name) <> "." <> format
  defp template_name(name, _format) when is_binary(name), do:
    name
end
