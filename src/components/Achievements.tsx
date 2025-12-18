import { motion } from 'framer-motion';
import { FadeIn } from './animations';
import { achievementsData, platformLogos } from '../data';

const Achievements = () => {
  return (
    <section id="achievements" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <FadeIn delay={0.1}>
          <motion.h2
            className="text-5xl sm:text-6xl md:text-[90px] font-bold leading-none wrap-break-words max-w-full"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            AWARDS &<br />
            <span className="text-white/10">RECOGNITION</span>
          </motion.h2>
          <motion.p
            className="text-tertiary text-lg mt-4"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            $26K+ in Hackathon Prizes Won
          </motion.p>
        </FadeIn>

        <div className="space-y-0">
          {achievementsData.map((achievement, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.1} fullWidth>
              <motion.div
                className="group block bg-white/0 hover:bg-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 border-b border-white/5 last:border-0 relative overflow-hidden"
                whileHover={{ scale: 1.01, x: 10 }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-orange/0 via-orange/5 to-orange/0 opacity-0 group-hover:opacity-100"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8 }}
                />

                <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                  {/* Platform Logo */}
                  <motion.div
                    className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-white/5 rounded-xl p-3 border border-white/10 flex items-center justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img 
                      src={platformLogos[achievement.platform]} 
                      alt={`${achievement.platform} logo`}
                      className="w-full h-full object-contain"
                    />
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 space-y-3 text-center md:text-left">
                    <div>
                      <motion.h3
                        className="text-2xl md:text-3xl font-semibold group-hover:text-orange transition-colors"
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        {achievement.name}
                      </motion.h3>
                      <p className="text-accent text-sm font-medium mt-1">{achievement.platform}</p>
                    </div>
                    <motion.p
                      className="text-tertiary leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                    >
                      {achievement.project}
                    </motion.p>
                    <p className="text-tertiary text-sm">{achievement.date}</p>
                  </div>

                  {/* Prize and Position */}
                  <motion.div
                    className="w-full md:w-40 shrink-0 text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-3xl md:text-4xl font-bold text-orange">{achievement.prize}</p>
                    <p className="text-xs text-tertiary uppercase tracking-wider mt-2">{achievement.position}</p>
                  </motion.div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;

