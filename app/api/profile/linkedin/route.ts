import { NextResponse } from 'next/server';

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string;
  summary: string;
  profilePicture: string;
  backgroundImage: string;
  connections: number;
  experiences: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
  lastUpdated: string;
}

export interface LinkedInExperience {
  company: string;
  companyLogo: string;
  companyUrl: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string;
}

export interface LinkedInEducation {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

let cachedProfile: LinkedInProfile | null = null;
let cacheTimestamp: number = 0;

async function fetchLinkedInProfile(): Promise<LinkedInProfile> {
  const APIFY_TOKEN = process.env.APIFY_TOKEN;
  const LINKEDIN_PROFILE_URL = process.env.LINKEDIN_PROFILE_URL || 'https://www.linkedin.com/in/abhinil-agarwal-975374145/';

  if (!APIFY_TOKEN) {
    console.warn('APIFY_TOKEN not set, returning static data');
    return getStaticProfile();
  }

  try {
    // Use Apify LinkedIn Profile Scraper
    const response = await fetch(
      `https://api.apify.com/v2/acts/anchor~linkedin-profile-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profileUrls: [LINKEDIN_PROFILE_URL],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const profiles = await response.json();
    
    if (profiles.length > 0) {
      const profile = profiles[0];
      return {
        name: profile.fullName || 'Abhinil Agarwal',
        headline: profile.headline || 'Web3 Developer & Blockchain Engineer',
        location: profile.location || 'India',
        summary: profile.summary || '',
        profilePicture: profile.profilePicture || 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
        backgroundImage: profile.backgroundImage || '',
        connections: profile.connectionCount || 500,
        experiences: (profile.experiences || []).map((exp: Record<string, string | null>) => ({
          company: exp.company || '',
          companyLogo: exp.companyLogo || '',
          companyUrl: exp.companyUrl || '',
          title: exp.title || '',
          description: exp.description || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate,
          location: exp.location || '',
        })),
        education: (profile.education || []).map((edu: Record<string, string>) => ({
          school: edu.school || '',
          degree: edu.degree || '',
          field: edu.field || '',
          startDate: edu.startDate || '',
          endDate: edu.endDate || '',
        })),
        skills: profile.skills || [],
        lastUpdated: new Date().toISOString(),
      };
    }

    return getStaticProfile();
  } catch (error) {
    console.error('Error fetching LinkedIn profile:', error);
    return getStaticProfile();
  }
}

function getStaticProfile(): LinkedInProfile {
  return {
    name: 'Abhinil Agarwal',
    headline: 'Web3 Developer & Blockchain Engineer | Solidity | DeFi | Full Stack',
    location: 'India',
    summary: 'Building decentralized applications and smart contracts. $1.5B+ bridged on-chain. $26K+ hackathon prizes won.',
    profilePicture: 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
    backgroundImage: '',
    connections: 500,
    experiences: [
      {
        company: 'CosX',
        companyLogo: '',
        companyUrl: 'https://www.cosx.ai/',
        title: 'Web3 Developer',
        description: 'AI and Web3 Led Business Transformation. We simplify AI and Web3 adoption by spending a weekend with founders.',
        startDate: 'Mar 2025',
        endDate: null,
        location: 'Remote',
      },
      {
        company: 'Pact Labs',
        companyLogo: '',
        companyUrl: 'https://pactlabs.xyz/',
        title: 'Blockchain Engineer',
        description: 'Asset-based lending powered by stablecoins. Onchain private credit funds.',
        startDate: 'Mar 2025',
        endDate: null,
        location: 'Remote',
      },
      {
        company: 'Equistart Labs',
        companyLogo: '',
        companyUrl: 'https://equistart.com/',
        title: 'Full Stack Web3 Developer',
        description: 'Scaled various end to end DApps from ideation to reality. Built DAO Tools, DEX, and Index Fund.',
        startDate: 'Jun 2022',
        endDate: 'Mar 2025',
        location: 'Remote',
      },
      {
        company: 'Celo Foundation',
        companyLogo: '',
        companyUrl: 'https://celo.org/',
        title: 'Web3 Developer',
        description: 'Pioneering financial tools and global digital payments accessible to all using crypto.',
        startDate: 'Mar 2022',
        endDate: 'May 2022',
        location: 'Remote',
      },
    ],
    education: [
      {
        school: 'IIIT Bangalore',
        degree: 'Integrated M.Tech',
        field: 'Computer Science',
        startDate: '2019',
        endDate: '2024',
      },
    ],
    skills: [
      'Solidity',
      'Web3',
      'React',
      'TypeScript',
      'Foundry',
      'Hardhat',
      'DeFi',
      'Smart Contracts',
      'Blockchain',
      'Move/Aptos',
    ],
    lastUpdated: new Date().toISOString(),
  };
}

export async function GET() {
  const now = Date.now();

  // Return cached data if valid
  if (cachedProfile && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json({
      profile: cachedProfile,
      cached: true,
      cacheAge: Math.floor((now - cacheTimestamp) / 1000),
    });
  }

  // Fetch fresh data
  const profile = await fetchLinkedInProfile();
  
  // Update cache
  cachedProfile = profile;
  cacheTimestamp = now;

  return NextResponse.json({
    profile,
    cached: false,
  });
}
