import "./globals.css";
import Link from "next/link";


export const metadata = {
  title: "Wildfire Data Dashboard",
  description: "Wildfire dispatch and FDRA data management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        
        <nav className="nav-Bar-Top">
          <div className="logo-navbar"> 
            <img src="/images/bwa_logo_150x150px.webp" width="60" height="60"/>
          </div>
          
          <Link href="/"> Home</Link>
          <Link href="/about"> Who We Are</Link>
          <Link href="/data"> Data</Link>
          <Link href="/learn-more"> Learn More</Link>
          <Link href="/map"> View Map</Link>
        </nav>
        <div className="page-container">
          {children}
        </div>
        
        <nav className="nav-Bar-Bottom">
          <Link href="/"> Home</Link>
          <Link href="/about"> Who We Are</Link>
          <Link href="/data"> Data</Link>
          <Link href="/learn-more"> Learn More</Link>
        </nav>
          
        
        <p className="contact-info">Contact us at **@gmail.com</p>
      </body>
    </html>
  );
}
