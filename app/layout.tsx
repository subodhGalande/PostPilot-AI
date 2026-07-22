import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Bricolage_Grotesque,
  Noto_Serif,
  Fira_Code,
} from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/providers/queryProvider";
import ThemeProvider from "@/lib/providers/themeProvider";
import { Toaster } from "@/components/ui/sonner";
import { AppTooltipProvider } from "@/lib/providers/tooltipProvider";
import NextTopLoader from "nextjs-toploader";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontHeading = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-heading",
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
  description:
    "Turn your raw ideas into perfect social posts for X and LinkedIn.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontHeading.variable} ${fontSerif.variable} ${fontMono.variable} antialiased tabular-nums`}
      >
        <NextTopLoader
          color="var(--primary)"
          showSpinner={false}
          shadow="0 0 10px var(--primary),0 0 5px var(--primary)"
        />
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
