// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import ContextMenu from "@/components/os/ContextMenu";
import ThemeHydrator from "@/components/ThemeHydrator";

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