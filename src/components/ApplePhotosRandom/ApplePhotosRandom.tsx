"use client";
import { LoadingProvider } from "@/helpers/Loading";
import React from "react";
import ApplePhotosRandomScreen from "./ApplePhotosRandomScreen";

export default function ApplePhotosRandom() {
  return (
    <LoadingProvider>
      <ApplePhotosRandomScreen />
    </LoadingProvider>
  );
}
