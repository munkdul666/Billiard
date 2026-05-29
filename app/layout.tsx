import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Billiard Bar",
  description: "Билliard барын бүртгэлийн систем",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className="dark">
      <body>{children}</body>
    </html>
  );
}
