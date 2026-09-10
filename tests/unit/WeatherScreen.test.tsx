import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ query: "kind=default", loading: vi.fn() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => new URLSearchParams(state.query) }));
vi.mock("@/i18n/useTranslationFromUrl", () => ({ default: () => ({ language: "en" }) }));
vi.mock("@/helpers/Loading", () => ({ useLoading: () => state.loading }));
vi.mock("../../src/components/Weather/CurrentWeather", () => ({ default: ({weatherData}: any) => <div data-temp={weatherData.currentWeather.main.temp}>Current conditions</div> }));
vi.mock("../../src/components/Weather/ForecastOnly", () => ({ default: ({weatherData}: any) => <div data-count={weatherData.forecast.list.length}>Forecast conditions</div> }));
vi.mock("../../src/components/Weather/ForecastSummary", () => ({ default: ({weatherData}: any) => <div data-count={weatherData.forecast.list.length}>Summary conditions</div> }));
vi.mock("../../src/components/Error/ErrorMessage", () => ({ default: ({errorMessage}: any) => <div>{errorMessage.message}</div> }));
import WeatherScreen from "../../src/components/Weather/WeatherScreen";
const current = { main: {temp:20}, weather:[{description:"Clear"}], dt:1788980000 };
const forecast = {list:[{main:{temp:20},weather:[{description:"Clear"}],dt_txt:"2026-09-09 12:00:00"}]};
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  container = document.createElement("div"); root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); vi.unstubAllGlobals(); });
const render = async () => { await act(async () => { root.render(<WeatherScreen/>); }); };
it.each([
  ["default", "current", "Current conditions"],
  ["forecast", "forecast", "Forecast conditions"],
])("renders %s even when the unused endpoint fails", async (kind, needed, label) => {
  state.query = `kind=${kind}`;
  const fetcher = vi.fn(async (url: string) => {
    const requested = new URL(url, "http://localhost").searchParams.get("kind");
    return {ok: requested === needed, json: async () => requested === needed ? needed === "current" ? current : forecast : {error:"Unavailable endpoint"}};
  });
  vi.stubGlobal("fetch",fetcher);
  await render();
  expect(container.textContent).toContain(label);
  expect(fetcher).toHaveBeenCalledOnce();
  expect(state.loading).toHaveBeenLastCalledWith(false);
});
it("loads both endpoints for the summary and for a timestamped forecast", async () => {
  const fetcher = vi.fn(async (url: string) => ({ok:true,json:async () => url.includes("kind=current") ? current : forecast}));
  vi.stubGlobal("fetch",fetcher);
  state.query = "kind=forecast-summary";
  await render();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(container.textContent).toContain("Summary conditions");
  state.query = "kind=forecast&displayLastUpdated=true";
  await render();
  expect(container.textContent).toContain("Forecast conditions");
});
it("fetches the forecast when switching from current to summary", async () => {
  state.query = "kind=default";
  const fetcher = vi.fn(async (url: string) => ({ok:true,json:async () => url.includes("kind=current") ? current : forecast}));
  vi.stubGlobal("fetch",fetcher);
  await render();
  fetcher.mockClear();
  state.query = "kind=forecast-summary";
  await render();
  expect(fetcher.mock.calls.some(([url]) => url.includes("kind=forecast"))).toBe(true);
});
