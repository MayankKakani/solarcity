import type { Metadata, Viewport } from "next";
import "./01-globals.css";
import { Analytics } from "@vercel/analytics/next";
import SiteShell from "./02-site-shell";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://solarplan-site-bro6.onrender.com/"),
  title: {
    default: "Solarplan - All you need for Solar O&M",
    template: "%s | Solarplan",
  },
  description: "All you need for Solar O&M.",
  keywords: [
    "solarplan",
    "solar management",
    "solar annual maintenance contract",
    "solar post sale",
    "Solar preventive maintenance",
    "solar breakage service",
    "solar task management",
    "solar amc",
    "solar service",
  ],
  applicationName: "Solarplan",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://solarplan-site-bro6.onrender.com/",
    siteName: "Solarplan",
    title: "Solarplan - All you need for Solar O&M.",
    description:
      "Solar service management that works for you, not against you. simple, and powerful.",
    images: [
      {
        url: "/solar-logo-dark.png",
        width: 1200,
        height: 630,
        alt: "Solarplan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Solarplan - ll you need for Solar O&M.",
    description:
      "Solar service management that works for you, not against you. simple, and powerful.",
    images: ["/solar-logo-dark.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  category: "productivity",
  creator: "Solarplan",
  publisher: "Solarplan",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;0,9..144,600;1,9..144,300;1,9..144,500&family=Figtree:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
        />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
      <Analytics />
    </html>
  );
}
