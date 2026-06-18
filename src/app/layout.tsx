import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NexFlow - Self-Service Leave Portal",
  description: "A premium, custom-styled employee self-service leave request and approvals portal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
      </head>
      <body>
        {children}
        <Script
          src="https://portaldev.mawarid.com.sa:6080/platform-test-ui/widget.js"
          data-agent-id="agent_1778665894232"
          data-token="pub_agent_1778665894232_1779432810590_e5ru1koo"
          data-position="bottom-left"
          data-theme="modern"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
