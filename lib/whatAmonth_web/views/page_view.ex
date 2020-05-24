defmodule WhatAmonthWeb.PageView do
  use WhatAmonthWeb, :view
  @colors [
    "#2287c9", # 1
    "#0279be", # 2
    "#72a869", # 3
    "#3a9c5a", # 4
    "#8cb056", # 5
    "#fccb84", # 6
    "#f6aa78", # 7
    "#f1816c", # 8
    "#f1791e", # 9
    "#eb6114", # 10
    "#52a3d9", # 11
    "#2287c9", # 12
  ]
  def getMonthColor(month) when is_number(month) do
    Enum.at(@colors, month, "#fff")
  end

end
