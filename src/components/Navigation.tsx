import { useState, useEffect } from 'react';
import { Home, Folder, Briefcase, Wrench, Edit, Dices } from 'lucide-react';
import { motion } from 'framer-motion';
import { MagneticButton } from './animations';

const Navigation = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Briefcase, label: 'Experience', href: '#experience' },
    { icon: Wrench, label: 'Tools', href: '#tools' },
    { icon: Folder, label: 'Projects', href: '#projects' },
    { icon: Edit, label: 'Thoughts', href: '#blog' },
    { icon: Dices, label: 'Potshot', href: '#potshot' },
  ];

  const container = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: -20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <motion.nav
      className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 hidden md:block"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.div
        className={`flex items-center gap-2 px-5 py-2 rounded-2xl border transition-all duration-300 ${
          scrolled
            ? 'bg-white/10 backdrop-blur-md border-white/20 shadow-lg'
            : 'bg-white/5 backdrop-blur-sm border-white/10'
        }`}
      >
        {navItems.map((navItem) => (
          <motion.div key={navItem.label} variants={item}>
            <a href={navItem.href} aria-label={navItem.label}>
            <MagneticButton
              className="group relative p-3 rounded-xl hover:bg-white/10 transition-all duration-300"
              strength={0.2}
            >
              
                <motion.div
                  className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-xs whitespace-nowrap pointer-events-none"
                  initial={{ y: -5 }}
                  whileHover={{ y: 0 }}
                >
                  {navItem.label}
                </motion.div>
                <navItem.icon className="w-5 h-5 text-secondary group-hover:text-orange transition-colors" />
              
            </MagneticButton>
            </a>
          </motion.div>
        ))}
      </motion.div>
    </motion.nav>
  );
};

export default Navigation;

