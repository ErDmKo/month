defmodule WhatAmonthWeb.LayoutView do
  use WhatAmonthWeb, :view
  require Logger

  def description(%{:isIndex => true}) do
    ~s/Номера месяцев в году/
  end

  def description(%{:month => month, :year => year}) do
    ~s/Номер месяца #{getTitle(month, year)} в году/
  end

  def description(%{:description => desc}) do
    ~s/#{desc}/
  end

  def description(_a) do
    "Номера месяцев в году"
  end


  def title(%{:title => title}) do
    ~s/#{title}/
  end

  def title(%{:isIndex => true}) do
    ~s/Какой месяц сейчас?/
  end

  def title(%{:month => month, :year => year}) do
    ~s/Какой номер месяца y #{getTitle(month, year)}?/
  end

  def title(_a) do
    "Какой номер у месяца"
  end

  def toRootButton(%{:rootButtonText => buttonText}) do
    ~s/#{buttonText}/
  end

  def toRootButton(_a) do
    "Текущий месяц"
  end
end
