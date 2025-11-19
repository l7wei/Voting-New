import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "學生會投票系統",
  description: "National Tsing Hua University Voting System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
