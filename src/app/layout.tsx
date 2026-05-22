import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
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
        <script
          src="https://portaldev.mawarid.com.sa:6080/platform-test-ui/widget.js"
          data-agent-id="agent_1778665894232"
          data-token="pub_agent_1778665894232_1779432810590_e5ru1koo"
          data-position="bottom-left"
          data-theme="modern"
          async
        ></script>
        {/* <script
          src="https://portaldev.mawarid.com.sa:6080/platform-test-ui/widget.js"
          data-agent-id="agent_1778129904545"
          data-token="pub_agent_1778129904545_1779433185510_g50akfe4"
          data-position="top-left"
          data-theme="modern"
          async
        ></script> */}
      </head>
      <body>{children}</body>
    </html>
  );
}
