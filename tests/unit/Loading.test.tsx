// @vitest-environment jsdom
import React, { act, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it } from "vitest";
import { LoadingProvider, useLoading } from "../../src/helpers/Loading";

function Task({ id, done = false }: { id: string; done?: boolean }) {
  const setLoading = useLoading({ id });
  useEffect(() => { if (done) setLoading(false); }, [done, setLoading]);
  return null;
}
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  root = createRoot(container);
});
afterEach(() => act(() => root.unmount()));
const render = (children: React.ReactNode) => act(() => {
  root.render(<LoadingProvider>{children}</LoadingProvider>);
});
const ready = () => !!container.querySelector("#website-has-loaded");
it("removes an unfinished task when its component unmounts", () => {
  render([<Task key="ready" id="ready" done />, <Task key="pending" id="pending" />]);
  expect(ready()).toBe(false);
  render([<Task key="ready" id="ready" done />]);
  expect(ready()).toBe(true);
});
it("waits for both components when they share a loading label", () => {
  render([<Task key="first" id="text" done />, <Task key="second" id="text" />]);
  expect(ready()).toBe(false);
  render([<Task key="first" id="text" done />, <Task key="second" id="text" done />]);
  expect(ready()).toBe(true);
});
it("does not inherit the completed state of a removed component", () => {
  render(<Task key="old" id="weather" done />);
  expect(ready()).toBe(true);
  render(<Task key="new" id="weather" />);
  expect(ready()).toBe(false);
});
