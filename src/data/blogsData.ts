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
];

