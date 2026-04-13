import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "TrooSync — AI Landing Page Personalizer",
  description:
    "Turn any ad creative into a perfectly matched, CRO-optimized landing page in seconds. Powered by Grok.",
  keywords: [
    "AI landing page",
    "CRO optimization",
    "ad personalization",
    "conversion rate optimization",
    "AI marketing",
  ],
  authors: [{ name: "TrooSync" }],
  openGraph: {
    title: "TrooSync — AI Landing Page Personalizer",
    description:
      "Turn any ad creative into a perfectly matched, CRO-optimized landing page in seconds.",
    type: "website",
    url: "https://troosync.vercel.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrooSync — AI Landing Page Personalizer",
    description: "Turn any ad into a CRO-optimized landing page in seconds.",
  },
};

export const viewport: Viewport = {
  themeColor: "#020208",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "rgba(5,5,20,0.95)",
              color: "#fff",
              border: "1px solid rgba(0,245,255,0.2)",
              backdropFilter: "blur(20px)",
              borderRadius: "12px",
            },
            success: {
              iconTheme: { primary: "#00f5ff", secondary: "#000" },
            },
            error: {
              iconTheme: { primary: "#ff00ff", secondary: "#000" },
            },
          }}
        />
      </body>
    </html>
  );
}
