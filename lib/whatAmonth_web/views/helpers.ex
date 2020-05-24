defmodule WhatAmonthWeb.TemplateHelpers do
  defp formatMonthP(date, skipNo) do
    timeFn = &Timex.format!(date, &1)
    no = if skipNo == false, do: timeFn.("{M} {Mfull} "), else: ""
    ~s/#{no}#{Timex.lformat!(date, "{Mfull}", "ru")}/
    |> String.capitalize
  end

  defp formatMonthP(date) do
    formatMonthP(date, false)
  end

  def getTitle(monthNo) when is_number(monthNo) do
    {:ok, date} = Date.new(2020, monthNo, 1)
    formatMonthP(date, true)
  end

  def formatMonth(monthNo) when is_number(monthNo) do
    {:ok, date} = Date.new(2020, monthNo, 1)
    formatMonth(date)
  end

  def formatMonth(%Date{} = date) do
    formatMonthP(date)
  end

  def formatMonth(%DateTime{} = date) do
    formatMonthP(date)
  end
end