const Footer = () => {
  return (
    <footer className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="text-center">
        <p className="text-tertiary">
          Made by{' '}
          <a
            href="https://templyo.io/templates"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange hover:underline"
          >
            Templyo
          </a>
          {' '}| Powered by{' '}
          <a
            href="https://www.framer.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange hover:underline"
          >
            Framer
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

