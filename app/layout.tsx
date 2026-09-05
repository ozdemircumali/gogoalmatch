import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GoGoalMatch",
  description: "Live Scores, Results and Football Statistics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
