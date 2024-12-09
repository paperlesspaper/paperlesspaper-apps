"use client";
import { LoadingProvider } from "@/helpers/Loading";
import React from "react";
import WeatherScreen from "./WeatherScreen";

export default function Weather() {
  return (
    <LoadingProvider>
      <WeatherScreen />
    </LoadingProvider>
  );
}
