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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'What is Abhinil Agarwal known for?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Abhinil Agarwal is a Web3 Developer and Blockchain Engineer who has built protocols that have bridged over $1.5B in assets on-chain. He specializes in DeFi development, DAO tooling, and cross-chain solutions using Solidity, Foundry, and modern web3 frameworks.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What APIs does Abhinil offer for AI agents?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Abhinil offers x402 protocol-enabled APIs including: Bridge Quote API ($0.01/request) for cross-chain route optimization, and DeFi Pool Analysis API ($0.02/request) for LP position analysis and impermanent loss calculation. These APIs allow AI agents to pay USDC for access.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What is x402 protocol and agentic commerce?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'x402 is an open payment protocol that uses HTTP 402 status codes to enable AI agents to pay for API access using stablecoins like USDC. Agentic commerce refers to machine-to-machine transactions where AI agents autonomously discover, pay for, and consume digital services.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'What DeFi projects has Abhinil built?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Abhinil has built: Crypto Index (decentralized structured investment funds), SimpliDAO (DAO governance tooling), DEX systems using Balancer V3 and Uniswap V3, cross-chain bridges, and Potshot (provably fair lottery using Chainlink VRF on Base).',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How can I hire Abhinil Agarwal?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'You can contact Abhinil through his website at abhinil.in, via email at abhijaipur2011@gmail.com, or through LinkedIn. He is available for Web3 development consulting, smart contract auditing, and blockchain engineering projects.',
                  },
                },
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
