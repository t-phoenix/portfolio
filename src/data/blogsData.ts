import blog1Img from '../assets/blogs/blog1.png';
import blog2Img from '../assets/blogs/blog2.png';
import blog3Img from '../assets/blogs/blog3.png';

export interface BlogArticle {
  title: string;
  description: string;
  date: string;
  readTime: string;
  url: string;
  image: string;
  source?: string; // e.g. 'HackerNoon'; omitted for the personal blog
}

export const blogsData: BlogArticle[] = [
  {
    title: 'Cryptocurrency Is Still the Investment Opportunity of the Decade',
    description: 'As we approach 2024, eager crypto enthusiasts are anticipating the upcoming BULL run in 2024-2025. I\'ve composed this article to ensure you have a chance to seize the opportunity without the risk of getting trapped in the bubble.',
    date: 'Feb 13, 2022',
    readTime: '6min read',
    url: 'https://abhinil.framer.website/blog/cryptocurrency-is-still-the-investment-opportunity-of-the-decade',
    image: blog1Img,
  },
  {
    title: 'The Metaverse Story: From GTA Vice City to the Sandbox',
    description: 'I started my digital journey in 2002 when a 5-year-old kid got a PC on his birthday. I didn\'t know much about technology at the time but games and movies were always my favorite. And then one fine day, a friend gave me a DVD containing a whole new gaming experience. It was GTA Vice City and the moment I started playing, I become a fan forever.',
    date: 'Nov 19, 2022',
    readTime: '4min read',
    url: 'https://abhinil.framer.website/blog/the-metaverse-story',
    image: blog2Img,
  },
  {
    title: 'Understanding Difference Between Currency And Money',
    description: 'Our school systems do not have money in our curriculum yet our life depends on it. We spend most of our lives worrying bout it, working for it, saving it, spending it, even fighting, dying, or killing for it. It defines our social status and even compromises our morals.',
    date: 'Feb 14, 2024',
    readTime: '4 min read',
    url: 'https://abhinil.framer.website/blog/undertanding-difference-between-currency-and-money',
    image: blog3Img,
  },
  {
    title: 'HTTP 402 Sat Unused for 30 Years. x402 Just Changed That.',
    description: 'x402 is an open protocol for pay-per-use API monetization using HTTP 402 and USDC micropayments. No API keys, no subscriptions, built for AI agents.',
    date: 'Jul 21, 2026',
    readTime: '9min read',
    url: 'https://hackernoon.com/http-402-sat-unused-for-30-years-x402-just-changed-that',
    image: 'https://hackernoon.imgix.net/images/7XySryL7eBZuFZKjRrt7WZ4k61G3-9e03kvo.png?auto=format&w=800',
    source: 'HackerNoon',
  },
  {
    title: 'Changing Private Keys, Not Addresses and Funds: Understanding Aptos Key Rotation',
    description: 'Keep the same wallet address while rotating private keys. No asset migration, no broken integrations, just upgradeable account security.',
    date: 'Apr 16, 2026',
    readTime: '3min read',
    url: 'https://hackernoon.com/changing-private-keys-not-addresses-and-funds-understanding-aptos-key-rotation',
    image: 'https://hackernoon.imgix.net/images/7XySryL7eBZuFZKjRrt7WZ4k61G3-an03hc8.jpeg?auto=format&w=800',
    source: 'HackerNoon',
  },
  {
    title: "If Your Memecoin Can't Make People Rich, You Have No Community",
    description: 'Memecoins are a reincarnation of the 2017 ICO wave, in a new form.',
    date: 'Feb 3, 2025',
    readTime: '7min read',
    url: 'https://hackernoon.com/if-your-memecoin-cant-make-people-rich-you-have-no-community',
    image: 'https://hackernoon.imgix.net/images/7XySryL7eBZuFZKjRrt7WZ4k61G3-xg7391u.jpeg?auto=format&w=800',
    source: 'HackerNoon',
  },
  {
    title: 'Global Norms Around a Change - Death of the US Dollar',
    description: 'The US dollar has lost 99% of its purchasing power in 100 years while our generation has forgotten about the value of gold. Learn about real money every day.',
    date: 'Jan 14, 2025',
    readTime: '10min read',
    url: 'https://hackernoon.com/global-norms-around-a-change-death-of-the-us-dollar',
    image: 'https://hackernoon.imgix.net/images/7XySryL7eBZuFZKjRrt7WZ4k61G3-8v53ctp.jpeg?auto=format&w=800',
    source: 'HackerNoon',
  },
];

