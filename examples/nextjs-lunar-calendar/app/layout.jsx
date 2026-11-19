import "./globals.css";

export const metadata = {
  title: "Vietnamese lunar calendar",
  description: "Month grid with lunar dates, can chi, solar terms, Tết countdown and a Zi Wei chart. Data: Nhat Nguyet (nhatnguyet.org)",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
