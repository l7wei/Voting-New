import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '清大線上投票系統',
  description: '國立清華大學學生會線上投票系統',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
