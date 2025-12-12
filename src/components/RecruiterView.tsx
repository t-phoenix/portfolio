import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Briefcase, Code, Award, Mail, MapPin } from 'lucide-react';

const RecruiterView = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickInfo = {
    targetRoles: ['Web3 Evangelist / DevRel', 'Senior Smart Contract Engineer', 'Senior Solidity Engineer'],
    keyAchievements: [
      '$1.5B+ USD bridged on-chain in production',
      '$26K+ in hackathon prizes won',
      '4+ years Web3/Solidity experience',
      'Expertise in DeFi, NFT, DAO protocols',
    ],
    topProjects: [
      { name: 'Crypto Index Fund', tech: 'Balancer V3 + Uniswap V3 architecture' },
      { name: 'Simpli DAO', tech: 'Won $2.5K - Full-stack DAO tooling' },
      { name: 'Volatility Fee Hook', tech: 'Won $2K - Balancer V3 smart hooks' },
    ],
    contact: {
      email: 'abhijaipur2011@gmail.com',
      phone: '+91-8107599599',
      location: 'Jaipur | Bangalore | Himachal',
      github: 'github.com/t-phoenix',
      linkedin: 'linkedin.com/in/abhinil-agarwal',
    },
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 bg-orange text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all group"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        <FileText className="w-6 h-6" />
        <motion.div
          className="absolute -top-12 right-0 bg-secondary px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
        >
          <span className="text-tertiary">Recruiter Quick View</span>
          <div className="absolute bottom-0 right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-secondary transform translate-y-full" />
        </motion.div>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-4 md:inset-10 bg-secondary rounded-2xl z-[70] overflow-y-auto border border-white/10"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className="sticky top-0 bg-secondary/95 backdrop-blur-lg p-6 border-b border-white/10 z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-primary">Abhinil Agarwal</h2>
                    <p className="text-orange font-medium">Senior Web3 & Solidity Engineer</p>
                  </div>
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-8">
                {/* Target Roles */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Briefcase className="w-6 h-6 text-orange" />
                    <h3 className="text-2xl font-semibold text-primary">Target Roles</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {quickInfo.targetRoles.map((role, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-orange/10 text-orange rounded-lg border border-orange/20 font-medium"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </motion.section>

                {/* Key Achievements */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="w-6 h-6 text-accent" />
                    <h3 className="text-2xl font-semibold text-primary">Key Achievements</h3>
                  </div>
                  <ul className="space-y-3">
                    {quickInfo.keyAchievements.map((achievement, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="text-orange text-xl">✓</span>
                        <span className="text-tertiary text-lg">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </motion.section>

                {/* Top Projects */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Code className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-semibold text-primary">Top 3 Projects</h3>
                  </div>
                  <div className="space-y-4">
                    {quickInfo.topProjects.map((project, index) => (
                      <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/5">
                        <h4 className="text-lg font-semibold text-orange mb-1">{project.name}</h4>
                        <p className="text-tertiary">{project.tech}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* Contact Info */}
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-orange/5 border border-orange/20 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="w-6 h-6 text-orange" />
                    <h3 className="text-2xl font-semibold text-primary">Contact Information</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-tertiary">
                    <div>
                      <p className="text-sm text-gray mb-1">Email</p>
                      <a
                        href={`mailto:${quickInfo.contact.email}`}
                        className="text-orange hover:underline font-medium"
                      >
                        {quickInfo.contact.email}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray mb-1">Phone</p>
                      <a href={`tel:${quickInfo.contact.phone}`} className="text-orange hover:underline font-medium">
                        {quickInfo.contact.phone}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray mb-1">GitHub</p>
                      <a
                        href={`https://${quickInfo.contact.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange hover:underline font-medium"
                      >
                        {quickInfo.contact.github}
                      </a>
                    </div>
                    <div>
                      <p className="text-sm text-gray mb-1">LinkedIn</p>
                      <a
                        href={`https://${quickInfo.contact.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-orange hover:underline font-medium"
                      >
                        {quickInfo.contact.linkedin}
                      </a>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray mb-1 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </p>
                      <p className="text-primary font-medium">{quickInfo.contact.location}</p>
                      <p className="text-sm text-accent mt-1">✓ Open to Remote | Hybrid | Relocation</p>
                    </div>
                  </div>
                </motion.section>

                {/* Print Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex justify-center"
                >
                  <motion.button
                    onClick={() => window.print()}
                    className="px-8 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accent/90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Print / Save as PDF
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RecruiterView;

