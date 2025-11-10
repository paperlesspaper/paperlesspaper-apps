import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upcoming Movies",
  description: "Discover the latest upcoming movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
