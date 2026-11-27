// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import ContextMenu from "@/components/os/ContextMenu";
import ThemeHydrator from "@/components/ThemeHydrator";


export const metadata: Metadata = {
  title: 'DossierOS',
  description: 'Portfolio OS called DossierOS, built with Next.js 14, TailwindCSS, and TypeScript.',
  icons: {
    icon: [
      { url: '/DOS-4.svg', type: 'image/svg+xml' },
      { url: '/DOS-4.png', type: 'image/png' },
    ],
    apple: '/DOS-4.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ThemeHydrator />
          <ContextMenu />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}