import "./globals.css";

export const metadata = {
  title: "Wildfire Data Dashboard",
  description: "Wildfire dispatch and FDRA data management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
