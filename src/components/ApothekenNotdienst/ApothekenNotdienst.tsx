"use client";
import { LoadingProvider } from "@/helpers/Loading";
import ApothekenNotdienstScreen from "./ApothekenNotdienstScreen";

export default function ApothekenNotdienst() {
  return (
    <LoadingProvider>
      <ApothekenNotdienstScreen />
    </LoadingProvider>
  );
}
