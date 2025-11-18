import type { Metadata } from 'next';
import './globals.css';
import { Inter } from "next/font/google";
import { HeroUIProvider } from "@heroui/react"; // 確保你有包這一層

export const metadata: Metadata = {
  title: '清大投票系統 | NTHU Voting System',
  description: 'National Tsing Hua University Student Association Voting System',
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        {/* 👇 2. 確保有用 HeroUIProvider 包住 */}
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}