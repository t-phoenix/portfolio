import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { FadeIn } from './animations';
import { projectsData } from '../data';

const Projects = () => {
  return (
    <section id="projects" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <FadeIn delay={0.1}>
          <motion.h2
            className="text-5xl sm:text-6xl md:text-[90px] font-bold leading-none wrap-break-words max-w-full"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            PERSONAL<br/> <span className="text-white/10">PROJECTS</span>
          </motion.h2>
        </FadeIn>

        <div className="space-y-0">
          {projectsData.map((project, index) => (
            <FadeIn key={index} delay={0.2 + index * 0.1} fullWidth>
              <motion.a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col md:flex-row items-start gap-6 bg-white/0 hover:bg-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 border-b border-white/5 last:border-0 relative overflow-hidden"
                whileHover={{
                  scale: 1.01,
                  x: 10,
                  transition: { duration: 0.3 },
                }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Hover background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-orange/0 via-orange/5 to-orange/0 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />

                {/* Project Image with 3D effect */}
                <motion.div
                  className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white/10 relative"
                  whileHover={{
                    rotateY: 5,
                    rotateX: 5,
                    scale: 1.05,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <motion.img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  {/* Holographic overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-orange/20 via-accent/20 to-transparent opacity-0 group-hover:opacity-100"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>

                <div className="flex-1 space-y-4 relative z-10">
                  <div className="flex items-start justify-between gap-4">
                    <motion.h3
                      className="text-3xl font-semibold group-hover:text-orange transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {project.name}
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
                    transition={{ duration: 0.2 }}
                  >
                    {project.description}
                  </motion.p>

                  {/* Tech Stack Badges */}
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {project.techStack.map((tech, techIndex) => (
                      <motion.span
                        key={techIndex}
                        className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full border border-accent/20"
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: 'rgba(108, 227, 182, 0.2)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {tech}
                      </motion.span>
                    ))}
                  </motion.div>

                  {/* Tags */}
                  <motion.div
                    className="flex flex-wrap gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.35 + index * 0.1 }}
                  >
                    {project.tags.map((tag, tagIndex) => (
                      <motion.span
                        key={tagIndex}
                        className="px-3 py-1 text-xs font-medium bg-orange/10 text-orange rounded-full border border-orange/20"
                        whileHover={{
                          scale: 1.1,
                          backgroundColor: 'rgba(244, 108, 56, 0.2)',
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        {tag}
                      </motion.span>
                    ))}
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

export default Projects;

