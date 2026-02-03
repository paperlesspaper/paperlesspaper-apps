import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GitHub Commit Graph",
  description: "Display a GitHub contributions graph and stats",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
