import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Apotheken-Notdienst",
  description:
    "Zeigt Apotheken im Bereitschaftsdienst basierend auf Daten von aponet.de",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <>{children}</>;
}
