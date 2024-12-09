"use client";
import React from "react";
import Day from "./Day";
import { LoadingProvider } from "@/helpers/Loading";

export default function DayCalendar() {
  return (
    <LoadingProvider>
      <Day />
    </LoadingProvider>
  );
}
