import { ArrowUpRight } from 'lucide-react';

const Blog = () => {
  const articles = [
    {
      title: 'Cryptocurrency Is Still the Investment Opportunity of the Decade',
      description: 'As we approach 2024, eager crypto enthusiasts are anticipating the upcoming BULL run in 2024-2025. I\'ve composed this article to ensure you have a chance to seize the opportunity without the risk of getting trapped in the bubble.',
      date: 'Feb 13, 2022',
      readTime: '6min read',
      url: 'https://abhinil.framer.website/blog/cryptocurrency-is-still-the-investment-opportunity-of-the-decade',
    },
    {
      title: 'The Metaverse Story: From GTA Vice City to the Sandbox',
      description: 'I started my digital journey in 2002 when a 5-year-old kid got a PC on his birthday. I didn\'t know much about technology at the time but games and movies were always my favorite. And then one fine day, a friend gave me a DVD containing a whole new gaming experience. It was GTA Vice City and the moment I started playing, I become a fan forever.',
      date: 'Nov 19, 2022',
      readTime: '4min read',
      url: 'https://abhinil.framer.website/blog/the-metaverse-story',
    },
    {
      title: 'Understanding Difference Between Currency And Money',
      description: 'Our school systems do not have money in our curriculum yet our life depends on it. We spend most of our lives worrying bout it, working for it, saving it, spending it, even fighting, dying, or killing for it. It defines our social status and even compromises our morals.',
      date: 'Feb 14, 2024',
      readTime: '4 min read',
      url: 'https://abhinil.framer.website/blog/undertanding-difference-between-currency-and-money',
    },
  ];

  return (
    <section id="blog" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <h2 className="text-7xl md:text-[90px] font-bold leading-none">
          ENGINEERING<br />
          <span className="text-white/10">THOUGHTS</span>
        </h2>

        <div className="grid md:grid-cols-1 gap-0">
          {articles.map((article, index) => (
            <a
              key={index}
              href={article.url}
              className="group block bg-white/0 hover:bg-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 relative border-b border-white/5 last:border-0"
            >
              <ArrowUpRight className="absolute top-8 right-6 w-5 h-5 text-orange -rotate-45 group-hover:rotate-0 transition-transform" />
              
              <div className="max-w-3xl space-y-4">
                <div className="flex items-start gap-5">
                  <h3 className="flex-1 text-2xl md:text-3xl font-semibold leading-tight group-hover:text-orange transition-colors">
                    {article.title}
                  </h3>
                </div>
                <p className="text-tertiary leading-relaxed">
                  {article.description}
                </p>
                <div className="flex justify-between items-center text-sm text-tertiary">
                  <span>{article.date}</span>
                  <span>{article.readTime}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;

