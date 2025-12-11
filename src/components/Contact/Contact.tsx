import { useState, type FormEvent } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    budget: '',
    message: '',
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({ name: '', email: '', budget: '', message: '' });
  };

  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="max-w-2xl space-y-8">
        <h2 className="text-7xl md:text-[90px] font-bold leading-none">
          LET'S WORK<br />
          <span className="text-white/10">TOGETHER</span>
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Email Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs text-gray uppercase font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Your Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary placeholder:text-gray/60 focus:outline-none focus:ring-1 focus:ring-orange transition-all"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs text-gray uppercase font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="Your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary placeholder:text-gray/60 focus:outline-none focus:ring-1 focus:ring-orange transition-all"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label htmlFor="budget" className="text-xs text-gray uppercase font-medium">
              Budget
            </label>
            <select
              id="budget"
              required
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary focus:outline-none focus:ring-1 focus:ring-orange transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Select…</option>
              <option value="<$3k">&lt;$3k</option>
              <option value="$3k - $5k">$3k - $5k</option>
              <option value="$5k - $10k">$5k - $10k</option>
              <option value=">$10k">&gt;$10k</option>
            </select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <label htmlFor="message" className="text-xs text-tertiary">
              Message
            </label>
            <textarea
              id="message"
              required
              placeholder="Message"
              rows={5}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3 py-3 bg-white/10 rounded-lg text-secondary placeholder:text-gray/60 focus:outline-none focus:ring-1 focus:ring-orange transition-all resize-vertical"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-orange hover:bg-orange/90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            Submit
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;

