import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthSessionInterceptor } from "@/components/layouts/auth-session-interceptor";
import Script from "next/script";

// Dùng local font để tránh hang khi Docker không có kết nối internet
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Job Matcher",
  description: "Tìm việc thông minh với AI",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geistSans.variable)}>
    <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <AuthSessionInterceptor />
      {children}

      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-DBDRP10LWJ"
      />

      <Script id="google-analytics">
        {`
          window.dataLayer = window.dataLayer || [];

          function gtag(){dataLayer.push(arguments);}

          gtag('js', new Date());

          gtag('config', 'G-DBDRP10LWJ');
        `}
        
      </Script>
      <Script
       async
       strategy="afterInteractive"
       src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6435352664997924"
     crossOrigin="anonymous"></Script>
    </body>
  </html>
  );
}
