import type { Metadata } from "next";
import { Roboto, Roboto_Condensed } from "next/font/google";
import ColorVariablesFromParam from "@/components/Theme/ColorVariablesFromParam";
import { Suspense } from "react";
import "./globals.scss";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
});

const robotoCondensed = Roboto_Condensed({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans-condensed",
});

export const metadata: Metadata = {
  title: "Calendar",
  description: "Display a calendar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body
        className={`${roboto.variable} ${robotoCondensed.variable} wrapper`}
      >
        <Suspense fallback={null}>
          <ColorVariablesFromParam />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
