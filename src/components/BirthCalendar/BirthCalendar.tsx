"use client";
import { LoadingProvider } from "@/helpers/Loading";
import React from "react";
import BirthCalendarScreen from "./BirthCalendarScreen";

export default function BirthCalendar() {
  return (
    <LoadingProvider>
      <BirthCalendarScreen />
    </LoadingProvider>
  );
}
