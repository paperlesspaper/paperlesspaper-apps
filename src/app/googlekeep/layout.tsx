import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Keep",
  description: "Display Google Keep notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
