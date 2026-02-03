import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Apple Photos (Random)",
  description: "Render a random image from a public Apple Photos shared album",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
