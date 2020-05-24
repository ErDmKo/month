defmodule WhatAmonthWeb.LayoutView do
  use WhatAmonthWeb, :view
  require Logger

  def title(%{:isIndex => true}) do
    ~s/Какой месяц сейчас?/
  end

  def title(%{:month => month}) do
    ~s/Какой номер месяца y #{getTitle(month)}?/
  end

  def title(_a) do
    "Какой номер у месяца"
  end
end
