import type { Metadata } from 'next';
import './globals.css';
import { HeroUIProvider } from "@heroui/react";

export const metadata: Metadata = {
  title: '清大投票系統 | NTHU Voting System',
  description: 'National Tsing Hua University Student Association Voting System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <HeroUIProvider>
          {children}
        </HeroUIProvider>
      </body>
    </html>
  );
}