"use client";
import { LoadingProvider } from "@/helpers/Loading";
import ApothekenNotdienstScreen from "./ApothekenNotdienstScreen";

export default function ApothekenNotdienst(): JSX.Element {
  return (
    <LoadingProvider>
      <ApothekenNotdienstScreen />
    </LoadingProvider>
  );
}
