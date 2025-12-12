import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animations';
import { experiencesData } from '../data';

const Experience = () => {
  return (
    <section id="experience" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <FadeIn delay={0.1}>
          <motion.h2
            className="text-7xl md:text-[90px] font-bold leading-none"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            4 YEARS OF WEB3
            <br />
            <span className="text-white/10">EXPERIENCE</span>
          </motion.h2>
        </FadeIn>

        <div className="space-y-0">
          {experiencesData.map((exp, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.1} fullWidth>
              <motion.a
                href={exp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white/0 hover:bg-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 border-b border-white/5 last:border-0 relative overflow-hidden"
                whileHover={{ scale: 1.01, x: 10 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange/0 via-orange/5 to-orange/0 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />

                <div className="flex items-start gap-6 relative z-10">
                  {/* Company Logo */}
                  <motion.div
                    className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white/10"
                    whileHover={{ rotate: [0, -5, 5, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img src={exp.logo} alt={exp.company} className="w-full h-full object-cover" />
                  </motion.div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <motion.h3
                        className="text-3xl font-semibold group-hover:text-orange transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {exp.company}
                      </motion.h3>
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 45 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <ArrowUpRight className="w-6 h-6 text-orange flex-shrink-0" />
                      </motion.div>
                    </div>
                    <motion.p
                      className="text-tertiary leading-relaxed max-w-3xl"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {exp.description}
                    </motion.p>
                  </div>
                </div>
                <motion.div
                  className="mt-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <p className="text-orange text-sm text-right font-medium">{exp.period}</p>
                </motion.div>
              </motion.a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

