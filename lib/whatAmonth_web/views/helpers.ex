defmodule WhatAmonthWeb.TemplateHelpers do

  @months [
    "январь", # 1
    "февраль", # 2
    "март", # 3
    "апрель", # 4
    "май", # 5
    "июнь", # 6
    "июль", # 7
    "август", # 8
    "сентябрь", # 9
    "октябрь", # 10
    "ноябрь", # 11
    "декабрь", # 12
  ]

  @pural [
    "первый", # 1
    "второй", # 2
    "третий", # 3
    "четвертый", # 4
    "пятый", # 5
    "шестой", # 6
    "седьмой", # 7
    "восьмой", # 8
    "девятый", # 9
    "десятый", # 10
    "одиннадцатый", # 11
    "двенадцатый", # 12
  ]

  defp pluralNumber(no) when is_integer(no) do
    Enum.at(@pural, no - 1, "неизвестно")
  end

  defp pluralNumber(no) when is_binary(no) do
    no
  end

  defp formatMonthP(date, skipNo) do
    monthNo = date.month
    literal = Enum.at(@months, monthNo - 1, 0)
    no = pluralNumber(date.month)
    result = case skipNo do
      false -> ~s/#{literal} #{no} месяц года/
      _ -> literal
    end
    String.capitalize(result)
  end

  defp formatMonthP(date) do
    formatMonthP(date, false)
  end

  def getTitle(monthNo, year) when is_number(monthNo) do
    {:ok, date} = Date.new(year, monthNo, 1)
    Timex.lformat!(date, ~s/{Mfull}/, "ru")
  end

  def formatMonth(monthNo, year) when is_number(monthNo) do
    {:ok, date} = Date.new(year, monthNo, 1)
    formatMonth(date)
  end

  def formatMonth(%Date{} = date) do
    formatMonthP(date)
  end

  def formatMonth(%DateTime{} = date) do
    formatMonthP(date)
  end
end