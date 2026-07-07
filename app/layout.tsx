import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PFP Golf · Playing With Pies",
  description: "Numbered collector golf hats with a one-tap charity give."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
