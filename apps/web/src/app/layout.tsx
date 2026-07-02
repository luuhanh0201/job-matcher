import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthSessionInterceptor } from "@/components/layouts/auth-session-interceptor";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/components/theme-provider";

// Dùng local font để tránh hang khi Docker không có kết nối internet
const googleSans = localFont({
  src: [
    {
      path: "../public/fonts/GoogleSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/GoogleSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/GoogleSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-google-sans",
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
    <html lang="en" className={cn("font-sans", googleSans.className)} suppressHydrationWarning>
      <head>
        <meta name="google-adsense-account" content="ca-pub-6435352664997924" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6435352664997924"
          crossOrigin="anonymous"
        />
      </head>
      <body className={`${googleSans.className}`}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
          <AuthSessionInterceptor />
          {children}
          <Toaster position="top-right" />

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
        </GoogleOAuthProvider>
      </ThemeProvider>
    </body>
  </html>
  );
}


