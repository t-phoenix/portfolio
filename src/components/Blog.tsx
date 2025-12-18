import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animations';
import { blogsData } from '../data';

const Blog = () => {
  return (
    <section id="blog" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <FadeIn delay={0.1}>
          <motion.h2
            className="text-5xl sm:text-6xl md:text-[90px] font-bold leading-none wrap-break-words max-w-full"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            ENGINEERING
            <br />
            <span className="text-white/10">THOUGHTS</span>
          </motion.h2>
        </FadeIn>

        <div className="grid md:grid-cols-1 gap-0">
          {blogsData.map((article, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.1} fullWidth>
              <motion.a
                href={article.url}
                className="group flex flex-col md:flex-row items-start gap-6 bg-white/0 hover:bg-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 relative border-b border-white/5 last:border-0 overflow-hidden"
                whileHover={{ scale: 1.01, x: 10 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange/0 via-orange/5 to-orange/0 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />

                {/* Blog Image */}
                <motion.div
                  className="w-full md:w-32 h-32 rounded-lg overflow-hidden shrink-0 bg-white/10"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                </motion.div>

                <div className="flex-1 space-y-4 relative z-10">
                  <div className="flex items-start gap-5">
                    <motion.h3
                      className="flex-1 text-2xl md:text-3xl font-semibold leading-tight group-hover:text-orange transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {article.title}
                    </motion.h3>
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 45 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <ArrowUpRight className="w-6 h-6 text-orange flex-shrink-0" />
                    </motion.div>
                  </div>
                  <motion.p
                    className="text-tertiary leading-relaxed"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {article.description}
                  </motion.p>
                  <motion.div
                    className="flex justify-between items-center text-sm text-orange font-medium"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <span>{article.date}</span>
                    <span>{article.readTime}</span>
                  </motion.div>
                </div>
              </motion.a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;

