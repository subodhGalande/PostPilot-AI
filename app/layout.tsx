import type { Metadata } from "next";
import { Inter, Noto_Serif, Fira_Code } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/providers/queryProvider";
import ThemeProvider from "@/lib/providers/themeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AppTooltipProvider } from "@/lib/providers/tooltipProvider";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PostPilot AI",
  description: "Next Gen AI for generating post ideas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable}  ${fontMono.variable} antialiased`}
      >
        <AppTooltipProvider>
          <ThemeProvider>
            <QueryProvider>{children}</QueryProvider>
            <Toaster closeButton richColors={true} position="top-center" />
          </ThemeProvider>
        </AppTooltipProvider>
      </body>
    </html>
  );
}
