import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GoGoalMatch - Live Football Scores",
  description:
    "Live Scores, Results and Football Statistics",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07140f] font-sans text-white antialiased">
        {children}
      </body>
    </html>
  );
}
