defmodule WhatAmonthWeb.TemplateHelpers do
  @months [
    # 1
    "январь",
    # 2
    "февраль",
    # 3
    "март",
    # 4
    "апрель",
    # 5
    "май",
    # 6
    "июнь",
    # 7
    "июль",
    # 8
    "август",
    # 9
    "сентябрь",
    # 10
    "октябрь",
    # 11
    "ноябрь",
    # 12
    "декабрь"
  ]

  @pural [
    # 1
    "первый",
    # 2
    "второй",
    # 3
    "третий",
    # 4
    "четвертый",
    # 5
    "пятый",
    # 6
    "шестой",
    # 7
    "седьмой",
    # 8
    "восьмой",
    # 9
    "девятый",
    # 10
    "десятый",
    # 11
    "одиннадцатый",
    # 12
    "двенадцатый"
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

    result =
      case skipNo do
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
