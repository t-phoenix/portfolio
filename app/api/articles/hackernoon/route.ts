import { NextResponse } from 'next/server';

export interface HackerNoonArticle {
  id: string;
  title: string;
  slug: string;
  link: string;
  excerpt: string;
  tldr: string;
  articleBody: string;
  createdAt: string;
  parentCategory: string;
  tags: string[];
  commentsCount: number;
  pageViews: number;
  mainImage: string;
  mainImageHeight: number;
  mainImageWidth: number;
  author_name: string;
  author_handle: string;
  author_avatar: string;
  author_bio: string;
}

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

let cachedArticles: HackerNoonArticle[] | null = null;
let cacheTimestamp: number = 0;

async function fetchHackerNoonArticles(): Promise<HackerNoonArticle[]> {
  const APIFY_TOKEN = process.env.APIFY_TOKEN;
  const HACKERNOON_HANDLE = process.env.HACKERNOON_HANDLE || 'tphoenix';

  if (!APIFY_TOKEN) {
    console.warn('APIFY_TOKEN not set, returning mock data');
    return getMockArticles();
  }

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/dadhalfdev~hackernoon-scraper/run-sync-get-dataset-items?token=${APIFY_TOKEN}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'AI',
          maxResults: 50,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status}`);
    }

    const articles: HackerNoonArticle[] = await response.json();
    
    // Filter articles by author handle
    const authorArticles = articles.filter(
      (article) => article.author_handle?.toLowerCase() === HACKERNOON_HANDLE.toLowerCase()
    );

    return authorArticles.length > 0 ? authorArticles : getMockArticles();
  } catch (error) {
    console.error('Error fetching HackerNoon articles:', error);
    return getMockArticles();
  }
}

function getMockArticles(): HackerNoonArticle[] {
  return [
    {
      id: '1',
      title: 'Cryptocurrency Is Still the Investment Opportunity of the Decade',
      slug: 'cryptocurrency-is-still-the-investment-opportunity-of-the-decade',
      link: 'https://hackernoon.com/cryptocurrency-is-still-the-investment-opportunity-of-the-decade',
      excerpt: 'As we approach 2024, eager crypto enthusiasts are anticipating the upcoming BULL run in 2024-2025.',
      tldr: 'Crypto remains a significant investment opportunity with proper risk management.',
      articleBody: '',
      createdAt: '2022-02-13',
      parentCategory: 'Cryptocurrency',
      tags: ['crypto', 'investment', 'defi'],
      commentsCount: 12,
      pageViews: 5420,
      mainImage: '',
      mainImageHeight: 630,
      mainImageWidth: 1200,
      author_name: 'Abhinil Agarwal',
      author_handle: 'tphoenix',
      author_avatar: 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
      author_bio: 'Web3 Developer & Blockchain Engineer',
    },
    {
      id: '2',
      title: 'The Metaverse Story: From GTA Vice City to the Sandbox',
      slug: 'the-metaverse-story',
      link: 'https://hackernoon.com/the-metaverse-story-from-gta-vice-city-to-the-sandbox',
      excerpt: 'I started my digital journey in 2002 when a 5-year-old kid got a PC on his birthday.',
      tldr: 'The evolution of virtual worlds from single-player games to blockchain metaverses.',
      articleBody: '',
      createdAt: '2022-11-19',
      parentCategory: 'Gaming',
      tags: ['metaverse', 'gaming', 'web3'],
      commentsCount: 8,
      pageViews: 3210,
      mainImage: '',
      mainImageHeight: 630,
      mainImageWidth: 1200,
      author_name: 'Abhinil Agarwal',
      author_handle: 'tphoenix',
      author_avatar: 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
      author_bio: 'Web3 Developer & Blockchain Engineer',
    },
    {
      id: '3',
      title: 'Understanding Difference Between Currency And Money',
      slug: 'understanding-difference-between-currency-and-money',
      link: 'https://hackernoon.com/understanding-difference-between-currency-and-money',
      excerpt: 'Our school systems do not have money in our curriculum yet our life depends on it.',
      tldr: 'Key differences between currency and money, and why it matters for crypto adoption.',
      articleBody: '',
      createdAt: '2024-02-14',
      parentCategory: 'Finance',
      tags: ['money', 'currency', 'economics'],
      commentsCount: 15,
      pageViews: 4100,
      mainImage: '',
      mainImageHeight: 630,
      mainImageWidth: 1200,
      author_name: 'Abhinil Agarwal',
      author_handle: 'tphoenix',
      author_avatar: 'https://framerusercontent.com/images/yGgneX4VBCYgL1RQKPjO1vXrCog.jpg',
      author_bio: 'Web3 Developer & Blockchain Engineer',
    },
  ];
}

export async function GET() {
  const now = Date.now();

  // Return cached data if valid
  if (cachedArticles && now - cacheTimestamp < CACHE_TTL) {
    return NextResponse.json({
      articles: cachedArticles,
      cached: true,
      cacheAge: Math.floor((now - cacheTimestamp) / 1000),
    });
  }

  // Fetch fresh data
  const articles = await fetchHackerNoonArticles();
  
  // Update cache
  cachedArticles = articles;
  cacheTimestamp = now;

  return NextResponse.json({
    articles,
    cached: false,
  });
}
