import { motion } from "framer-motion";
import { FadeIn } from "../animations";
import { MIN_TICKET_PRICE } from "./helper/constants";

export const PotshotHeader = () => {
  return (
    <FadeIn delay={0.1}>
      <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.p
            className="font-mono text-xs uppercase tracking-[0.14em] text-dim max-w-2xl"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            On-chain raffle on Base. Min ${MIN_TICKET_PRICE} per play. Contribute more to grow the pot.
          </motion.p>
        </motion.div>
    </FadeIn>
  );
};
