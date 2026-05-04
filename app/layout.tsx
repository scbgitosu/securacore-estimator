import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Design My System — SecuraCore',
  description: 'Get a personalized security system estimate from SecuraCore.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
