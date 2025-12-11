const Tools = () => {
  const tools = [
    {
      name: 'Ethereum',
      category: 'L1 Blockchain',
      icon: 'https://framerusercontent.com/images/fr4ttSnxCzkwZSxztDIiB8dRo.png',
    },
    {
      name: 'Solidity',
      category: 'Programming Language',
      icon: 'https://framerusercontent.com/images/oYCEVM4YJChGHUMwH5nhGkL0mvs.png',
    },
    {
      name: 'Foundry',
      category: 'Solidity App Development Tool',
      icon: 'https://framerusercontent.com/images/8LiGPKkCcqmFknL98lm2xDO58ro.png',
    },
    {
      name: 'Wallet Connect',
      category: 'Web3 Wallet Tool',
      icon: 'https://framerusercontent.com/images/AN9yli2PxpgHFuaqq2J95mJWgQ.png',
    },
    {
      name: 'React/ React-Native',
      category: 'Frontend Frameworks',
      icon: 'https://framerusercontent.com/images/cDM5sc8ktSTfJhvaYZy9EeM.png',
    },
    {
      name: 'Java Script',
      category: 'Programming Language',
      icon: 'https://framerusercontent.com/images/VXaePJuBjWampALRQfe7YUTIxc.png',
    },
    {
      name: 'Ethers.js',
      category: 'Web3 sdk',
      icon: 'https://framerusercontent.com/images/MHyWwWZFLldPNrVbAOs4QHPWMUw.png',
    },
    {
      name: 'Alchemy',
      category: 'Node Provider',
      icon: 'https://framerusercontent.com/images/uCi29nMJY0sHwZ8o4MkvLKjqDbw.png',
    },
  ];

  return (
    <section id="tools" className="py-32 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="space-y-12">
        <h2 className="text-7xl md:text-[90px] font-bold leading-none">
          FAMILIAR<br />
          <span className="text-white/10">TOOLS</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="group bg-white/0 hover:bg-white/5 rounded-xl p-4 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-white/10">
                  <img 
                    src={tool.icon} 
                    alt={tool.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold mb-1 group-hover:text-orange transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-tertiary text-sm leading-snug">
                    {tool.category}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Tools;

