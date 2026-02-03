"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo } from "react";

const THEME_CLASSES = [
  "dark",
  "light",
  "red-dark",
  "red-light",
  "blue-dark",
  "blue-light",
  "green-dark",
  "green-light",
] as const;

type ThemeName = (typeof THEME_CLASSES)[number];

const THEME_CLASS_SET: ReadonlySet<string> = new Set(THEME_CLASSES);

const normalizeTheme = (
  value: string | null,
  fallback: ThemeName,
): ThemeName =>
  value && THEME_CLASS_SET.has(value) ? (value as ThemeName) : fallback;

type Props = {
  paramName?: string;
  defaultTheme?: ThemeName;
};

export default function ColorVariablesFromParam({
  paramName = "color",
  defaultTheme = "dark",
}: Props) {
  const searchParams = useSearchParams();

  const theme = useMemo(
    () => normalizeTheme(searchParams.get(paramName), defaultTheme),
    [searchParams, paramName, defaultTheme],
  );

  useEffect(() => {
    const root = document.body;
    root.classList.remove(...THEME_CLASSES);
    root.classList.add(theme);

    return () => {
      root.classList.remove(...THEME_CLASSES);
    };
  }, [theme]);

  return null;
}
