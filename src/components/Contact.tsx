import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { FadeIn, MagneticButton } from "./animations";
import { socialLinksData } from "../data/socialLinksData";

// EmailJS Configuration - Using environment variables
// Make sure to set these in your .env.local file
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Get current timestamp for the email
      const currentTime = new Date().toLocaleString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Send email using EmailJS
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          time: currentTime,
        },
        EMAILJS_PUBLIC_KEY
      );

      console.log("Email sent successfully:", result.text);
      setIsSubmitting(false);
      setIsSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({ name: "", email: "", subject: "", message: "" });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Email sending failed:", error);
      setIsSubmitting(false);
      setErrorMessage("Failed to send message. Please try again.");
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage("");
      }, 5000);
    }
  };

  return (
    <section id="contact" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Desktop: Two Column Layout | Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Column: Form Section */}
        <div className="lg:col-span-7">
          <FadeIn delay={0.1}>
            <motion.h2
              className="text-7xl md:text-[90px] font-bold leading-none mb-8"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              LET'S WORK
              <br />
              <span className="text-white/10">TOGETHER</span>
            </motion.h2>

            {/* Geographic Flexibility */}
            <motion.div
              className="flex flex-col gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center  gap-3">
                <motion.span
                  className="text-2xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📍
                </motion.span>
                <div>
                  <p className="text-tertiary text-sm">Based in:</p>
                  <p className="text-secondary font-medium">
                    Jaipur | Bangalore | Himachal, India 🇮🇳
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.span
                  className="text-2xl"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✈️
                </motion.span>
                <div>
                  <p className="text-tertiary text-sm">Open to:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="px-3 py-1 text-xs font-medium bg-accent/10 text-accent rounded-full border border-accent/20">
                      Remote
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-orange/10 text-orange rounded-full border border-orange/20">
                      Hybrid
                    </span>
                    <span className="px-3 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                      Relocation
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </FadeIn>

          <FadeIn delay={0.3} fullWidth>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid md:grid-cols-2 gap-6">
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <label
                    htmlFor="name"
                    className="text-xs text-gray uppercase font-medium"
                  >
                    Name
                  </label>
                  <motion.input
                    id="name"
                    type="text"
                    required
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-orange transition-all"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <label
                    htmlFor="email"
                    className="text-xs text-gray uppercase font-medium"
                  >
                    Email
                  </label>
                  <motion.input
                    id="email"
                    type="email"
                    required
                    placeholder="Your@email.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-orange transition-all"
                    whileFocus={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  />
                </motion.div>
              </div>

              {/* Subject */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <label
                  htmlFor="subject"
                  className="text-xs text-gray uppercase font-medium"
                >
                  Subject
                </label>
                <motion.input
                  id="subject"
                  type="text"
                  required
                  placeholder="What's this about?"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-orange transition-all"
                  whileFocus={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

              {/* Message */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <label htmlFor="message" className="text-xs text-tertiary">
                  Message
                </label>
                <motion.textarea
                  id="message"
                  required
                  placeholder="Message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary placeholder:text-gray/60 focus:outline-none focus:ring-2 focus:ring-orange transition-all resize-vertical"
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                />
              </motion.div>

              {/* Error Message */}
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <p className="text-red-400 text-sm text-center">
                    {errorMessage}
                  </p>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <MagneticButton
                  className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  strength={0.2}
                >
                  <motion.button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isSuccess}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? (
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="inline-block"
                      >
                        ⏳
                      </motion.span>
                    ) : isSuccess ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        ✓ Sent Successfully!
                      </motion.span>
                    ) : (
                      "Submit"
                    )}
                  </motion.button>
                </MagneticButton>
              </motion.div>
            </form>
          </FadeIn>
        </div>

        {/* Right Column: Social Section - Desktop Only */}
        <div className="lg:col-span-5 hidden lg:block">
          <FadeIn delay={0.4}>
            <div className="sticky top-32">
              <motion.div
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {/* Header */}
                <motion.h3
                  className="text-3xl font-bold mb-2 bg-black text-white  from-orange via-accent to-orange bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  Let's Connect
                </motion.h3>
                <p className="text-tertiary text-sm mb-8">
                  Follow my journey in Web3 & blockchain
                </p>

                {/* Social Icons */}
                <div className="space-y-4">
                  {socialLinksData.map((social, index) => (
                    <>
                      {social.label === "Instagram" ? (
                        <></>
                      ) : (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:border-orange/50 transition-all duration-300"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          whileHover={{ scale: 1.05, x: 10 }}
                        >
                          {/* Icon Container */}
                          <motion.div
                            className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0"
                            whileHover={{
                              boxShadow: `0 0 20px ${social.color}50`,
                            }}
                          >
                            <motion.div
                              className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                              style={{
                                background: `linear-gradient(135deg, ${social.color}, transparent)`,
                              }}
                            />
                            <img
                              src={social.icon}
                              alt={social.label}
                              className="w-full h-full object-cover p-2"
                            />
                          </motion.div>

                          {/* Label and Arrow */}
                          <div className="flex items-center justify-between flex-1">
                            <span className="text-secondary font-medium group-hover:text-orange transition-colors">
                              {social.label}
                            </span>
                            <motion.span
                              className="text-tertiary group-hover:text-orange transition-colors"
                              initial={{ x: 0 }}
                              whileHover={{ x: 5 }}
                            >
                              →
                            </motion.span>
                          </div>
                        </motion.a>
                      )}
                    </>
                  ))}
                </div>

                {/* Bottom Accent */}
                <motion.div
                  className="mt-8 pt-6 border-t border-white/10"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                >
                  <p className="text-xs text-tertiary text-center">
                    Future is digital, let's build it together
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </FadeIn>
        </div>

        {/* Mobile: Social Section at Bottom */}
        <div className="lg:hidden">
          <FadeIn delay={0.6} fullWidth>
            <motion.div
              className="pt-12 border-t border-white/10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.h3
                className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-orange via-accent to-orange bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Let's Connect
              </motion.h3>

              {/* Social Icons Grid - Mobile */}
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                {socialLinksData.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.7 + index * 0.1,
                      type: "spring",
                      stiffness: 200,
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Glow Effect */}
                    <motion.div
                      className="absolute -inset-2 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300"
                      style={{
                        background: `radial-gradient(circle, ${social.color}40 0%, transparent 70%)`,
                      }}
                    />

                    {/* Icon Container */}
                    <motion.div
                      className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 group-hover:border-orange/50 transition-all duration-300"
                      whileHover={{
                        boxShadow: `0 0 25px ${social.color}50`,
                      }}
                    >
                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                        style={{
                          background: `linear-gradient(135deg, ${social.color}, transparent)`,
                        }}
                      />
                      <img
                        src={social.icon}
                        alt={social.label}
                        className="relative w-full h-full object-cover p-3 group-hover:p-2 transition-all duration-300"
                      />
                    </motion.div>

                    {/* Label */}
                    <motion.span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-tertiary opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300">
                      {social.label}
                    </motion.span>
                  </motion.a>
                ))}
              </div>

              <p className="text-xs text-tertiary text-center mt-8">
                Follow my journey in Web3 & blockchain development
              </p>
            </motion.div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default Contact;
