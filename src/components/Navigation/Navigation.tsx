import { Home, Folder, Briefcase, Wrench, Edit } from 'lucide-react';

const Navigation = () => {
  const navItems = [
    { icon: Home, label: 'Home', href: '#' },
    { icon: Folder, label: 'Projects', href: '#projects' },
    { icon: Briefcase, label: 'Experience', href: '#experience' },
    { icon: Wrench, label: 'Tools', href: '#tools' },
    { icon: Edit, label: 'Thoughts', href: '#blog' },
  ];

  return (
    <nav className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 hidden md:block">
      <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm px-5 py-2 rounded-2xl">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="group relative p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            aria-label={item.label}
          >
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg text-xs whitespace-nowrap">
              {item.label}
            </div>
            <item.icon className="w-5 h-5 text-secondary" />
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;

