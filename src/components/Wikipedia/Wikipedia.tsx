"use client";
import { LoadingProvider } from "@/helpers/Loading";
import React from "react";
import WikipediaScreen from "./WikipediaScreen";

export default function Wikipedia() {
  return (
    <LoadingProvider>
      <WikipediaScreen />
    </LoadingProvider>
  );
}
