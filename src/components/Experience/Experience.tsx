import { ArrowUpRight } from 'lucide-react';

const Experience = () => {
  const experiences = [
    {
      company: 'CosX',
      url: 'https://www.cosx.ai/',
      description: 'AI and Web3 Led Business Transformation. We simplify AI and Web3 adoption by spending a weekend with founders, identifying manual bottlenecks, and delivering tailored solutions that actually ship.',
      period: 'Mar 25 - present',
    },
    {
      company: 'Pact labs',
      url: 'https://pactlabs.xyz/',
      description: 'Asset-based lending powered by stablecoins. Onchain private credit funds and facilities connected with originators and borrowers.',
      period: 'Mar 25 - present',
    },
    {
      company: 'Celo Foundation',
      url: 'https://celo.org/',
      description: 'Celo is pioneering to deliver financial tools and global digital payments accessible to all using crypto. The user-centric approach helps us focus on enabling prosperity for all, making crypto mobile and usable.',
      period: 'Mar 2022 - May 2022',
    },
    {
      company: 'ETG India',
      url: 'https://etgindia.com/index.html',
      description: 'Led the development team in creating corporate centric insureTech hybrid mobile application, Hands on experience with React-Native, GCP AI tools, firebase and more',
      period: 'Jan 2021 - Jun 2021',
    },
  ];

  return (
    <section id="experience" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <h2 className="text-7xl md:text-[90px] font-bold leading-none">
          4 YEARS OF WEB3<br />
          <span className="text-white/10">EXPERIENCE</span>
        </h2>

        <div className="space-y-0">
          {experiences.map((exp, index) => (
            <a
              key={index}
              href={exp.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block bg-white/0 hover:bg-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 border-b border-white/5 last:border-0"
            >
              <div className="flex items-start gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-3xl font-semibold group-hover:text-orange transition-colors">
                      {exp.company}
                    </h3>
                    <ArrowUpRight className="w-5 h-5 text-orange flex-shrink-0 -rotate-45 group-hover:rotate-0 transition-transform" />
                  </div>
                  <p className="text-tertiary leading-relaxed max-w-3xl">
                    {exp.description}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-tertiary text-sm text-right">{exp.period}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

