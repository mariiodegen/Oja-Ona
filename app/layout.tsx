import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ogaranya = localFont({
  src: [
    {
      path: "./fonts/OGARANYA-Regular.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-ogaranya",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ọjà Ọnà — Physical Art Marketplace",
  description:
    "Direct-from-artist Nigerian artworks with on-chain authenticity certificates, NFC verification, and escrow protection.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${ogaranya.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
