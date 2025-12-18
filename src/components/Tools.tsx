import { motion } from 'framer-motion';
import { FadeIn } from './animations';
import { toolsData } from '../data';

const Tools = () => {
  return (
    <section id="tools" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <FadeIn delay={0.1}>
          <motion.h2
            className="text-5xl sm:text-6xl md:text-[90px] font-bold leading-none wrap-break-words max-w-full"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            FAMILIAR
            <br />
            <span className="text-white/10">TOOLS</span>
          </motion.h2>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {toolsData.map((tool, index) => (
            <FadeIn key={index} delay={0.1 + index * 0.05}>
              <motion.div
                className="group bg-white/0 hover:bg-white/5 rounded-xl p-4 transition-all duration-300 cursor-pointer border border-white/0 hover:border-white/10"
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-white/10"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img src={tool.icon} alt={tool.name} className="w-full h-full object-cover" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <motion.h3
                      className="text-xl font-semibold mb-1 group-hover:text-orange transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {tool.name}
                    </motion.h3>
                    <p className="text-tertiary text-sm leading-snug">{tool.category}</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tools;

