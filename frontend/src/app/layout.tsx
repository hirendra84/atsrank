import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://atsrank.com'),
  title: {
    default: "AtsRank - AI Resume Optimization & ATS Scoring Software",
    template: "%s | AtsRank"
  },
  description: "Optimize your resume for ATS algorithms, get instant alignment scores, and boost your job application success with AtsRank's AI-powered analysis.",
  keywords: ["resume scanner", "ATS optimization", "AI resume builder", "resume scoring", "applicant tracking system", "career growth", "AtsRank"],
  authors: [{ name: "AtsRank Team", url: "https://atsrank.com" }],
  creator: "AtsRank",
  publisher: "AtsRank",
  applicationName: "AtsRank",
  generator: "Next.js",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://atsrank.com',
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://atsrank.com",
    title: "AtsRank - AI Resume Optimization & ATS Scoring Software",
    description: "Optimize your resume for ATS algorithms, get instant alignment scores, and boost your job application success with AtsRank's AI-powered analysis.",
    siteName: "AtsRank",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AtsRank - AI Resume Optimization",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AtsRank - AI Resume Optimization & ATS Scoring",
    description: "Optimize your resume for ATS algorithms and boost your job application success.",
    creator: "@atsrank",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/apple-touch-icon-precomposed.png",
    },
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "AtsRank",
        "operatingSystem": "WebBrowser",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "AI-powered resume optimization and ATS scoring tool.",
        "url": "https://atsrank.com"
      },
      {
        "@type": "Organization",
        "name": "AtsRank",
        "url": "https://atsrank.com",
        "logo": "https://atsrank.com/icon.svg",
        "sameAs": [
          "https://twitter.com/atsrank",
          "https://linkedin.com/company/atsrank"
        ]
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow flex flex-col relative">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
