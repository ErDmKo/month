defmodule WhatAmonthWeb.MainLayoutView do
  use WhatAmonthWeb, :view
  require Logger

  def description(_a) do
    ~s/Описаник/
  end

  def title(_a) do
      "erdmko - home page"
  end
end