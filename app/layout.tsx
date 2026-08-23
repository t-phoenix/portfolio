import type { Metadata, Viewport } from 'next';
import { Poppins, Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Abhinil Agarwal - Web3 Developer & Blockchain Engineer | Solidity Expert | DeFi Builder',
  description: 'Abhinil Agarwal is a Web3 Developer and Blockchain Engineer specializing in Solidity, DeFi, DAOs, and Smart Contracts. Building decentralized applications (DApps) with React, Foundry, and Web3 technologies. Based in India, open to remote work.',
  keywords: [
    'Abhinil Agarwal',
    'Web3 Developer',
    'Blockchain Engineer',
    'Solidity Developer',
    'DeFi Developer',
    'Smart Contract Developer',
    'DAO Developer',
    'React Developer',
    'Full Stack Developer',
    'Aptos Developer',
    'x402',
    'Agentic Commerce',
  ],
  authors: [{ name: 'Abhinil Agarwal' }],
  creator: 'Abhinil Agarwal',
  metadataBase: new URL('https://www.abhinil.in'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.abhinil.in',
    title: 'Abhinil Agarwal - Web3 Developer & Blockchain Engineer',
    description: 'Web3 Developer and Blockchain Engineer specializing in Solidity, DeFi, DAOs, and Smart Contracts. Building decentralized applications with React, Foundry, and Web3 technologies.',
    siteName: 'Abhinil Agarwal Portfolio',
    images: [
      {
        url: 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
        width: 1200,
        height: 630,
        alt: 'Abhinil Agarwal - Web3 Developer & Blockchain Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Abhinil Agarwal - Web3 Developer & Blockchain Engineer',
    description: 'Web3 Developer and Blockchain Engineer specializing in Solidity, DeFi, DAOs, and Smart Contracts.',
    images: ['https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
  },
};

export const viewport: Viewport = {
  themeColor: '#F46C38',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} dark`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Abhinil Agarwal',
              url: 'https://www.abhinil.in',
              image: 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
              jobTitle: 'Web3 Developer & Blockchain Engineer',
              description: 'Web3 Developer and Blockchain Engineer specializing in Solidity, DeFi, DAOs, and Smart Contracts.',
              sameAs: [
                'https://github.com/t-phoenix',
                'https://x.com/touchey_phoenix',
                'https://www.linkedin.com/in/abhinil-agarwal-975374145/',
                'https://hackernoon.com/u/tphoenix',
              ],
              knowsAbout: [
                'Web3 Development',
                'Blockchain Engineering',
                'Solidity',
                'DeFi',
                'Smart Contracts',
                'x402 Protocol',
                'Agentic Commerce',
                'Move/Aptos',
              ],
            }),
          }}
        />
      </head>
      <body className="bg-primary text-secondary font-poppins antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
