defmodule WhatAmonthWeb.MonthPageView do
  use WhatAmonthWeb, :view

  @colors [
    # 1
    "#2287c9",
    # 2
    "#0279be",
    # 3
    "#72a869",
    # 4
    "#3a9c5a",
    # 5
    "#8cb056",
    # 6
    "#fccb84",
    # 7
    "#f6aa78",
    # 8
    "#f1816c",
    # 9
    "#f1791e",
    # 10
    "#eb6114",
    # 11
    "#52a3d9",
    # 12
    "#2287c9"
  ]
  def getMonthColor(month) when is_number(month) do
    Enum.at(@colors, month, "#fff")
  end
end
