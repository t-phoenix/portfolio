import { motion } from 'framer-motion';
import { FadeIn } from './animations';

const Footer = () => {
  return (
    <footer className="py-20 px-4 md:px-8 max-w-7xl mx-auto border-t border-white/10">
      <FadeIn delay={0.1}>
        <div className="text-center space-y-4">
          <motion.p
            className="text-tertiary"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Inspired from{' '}
            <motion.a
              href="https://templyo.io/templates"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:underline"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Templyo
            </motion.a>
            {' '}| Powered by{' '}
            <motion.a
              href="https://www.cursor.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:underline"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Cursor
            </motion.a>
          </motion.p>
          <motion.p
            className="text-tertiary text-sm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            © {new Date().getFullYear()} Abhinil Agarwal. All rights reserved.
          </motion.p>
        </div>
      </FadeIn>
    </footer>
  );
};

export default Footer;

