import "./globals.css";

export const metadata = {
  title: "GigShield AI",
  description: "Parametric insurance for food delivery partners"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
