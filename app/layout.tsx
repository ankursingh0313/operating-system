// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "@/components/ReduxProvider";
import ContextMenu from "@/components/os/ContextMenu";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ContextMenu />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}