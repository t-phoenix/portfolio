import { ArrowUpRight } from 'lucide-react';

const Projects = () => {
  const projects = [
    {
      name: 'Rekt CEO',
      url: 'https://www.rektceo.club/',
      description: 'A web3 native brand bridging web2 fun and interaction with web3 ethos of digital ownership',
      image: 'https://framerusercontent.com/images/q6N8JcvKzE7rJR8yX3fhv4IYTM.png',
    },
    {
      name: 'Crypto Index',
      url: 'https://crypto-index-wine.vercel.app/',
      description: 'Decentralised Structured Investment Funds, a tech that can help initiate Index Fund, Mutual funds and other funds. (DeFi)',
      image: 'https://framerusercontent.com/images/ZD8lkiKbIaj9LnoRsm04JcUJLo4.png',
    },
    {
      name: 'Simpli DAO',
      url: 'https://simpli-dao.vercel.app/',
      description: 'DAO Tooling Full Stack App, that helps manage an inchain community. Create proposal, vote using tokens, and automated payouts.',
      image: 'https://framerusercontent.com/images/1wtNZlelowyiIhkLymltlPWEXM0.png',
    },
  ];

  return (
    <section id="projects" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <h2 className="text-7xl md:text-[90px] font-bold leading-none">
          PERSONAL <span className="text-white/10">PROJECTS</span>
        </h2>

        <div className="space-y-0">
          {projects.map((project, index) => (
            <a
              key={index}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col md:flex-row items-start gap-6 bg-white/0 hover:bg-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 border-b border-white/5 last:border-0"
            >
              <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                <img 
                  src={project.image} 
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-3xl font-semibold group-hover:text-orange transition-colors">
                    {project.name}
                  </h3>
                  <ArrowUpRight className="w-5 h-5 text-orange flex-shrink-0 -rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
                <p className="text-tertiary leading-relaxed">
                  {project.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;

