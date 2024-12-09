import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar",
  description: "Display a calendar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
