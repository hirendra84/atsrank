import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Features | AtsRank - AI Resume Analyzer',
  description: 'Explore the powerful features of AtsRank: ATS compatibility scanning, skill gap analysis, personalized improvement tips, and AI-powered grammar checks.',
  alternates: {
    canonical: '/features',
  },
  openGraph: {
    title: 'Features | AtsRank - AI Resume Analyzer',
    description: 'Explore the powerful features of AtsRank: ATS compatibility scanning, skill gap analysis, personalized improvement tips, and AI-powered grammar checks.',
    url: '/features',
    type: 'website',
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AtsRank Features - AI Resume Optimization",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Features | AtsRank - AI Resume Analyzer",
    description: "Explore the powerful features of AtsRank: ATS compatibility scanning, skill gap analysis, and AI-powered grammar checks.",
    images: ["/og-image.jpg"],
  },
};

export default function FeaturesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
