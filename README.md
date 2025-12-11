# Abhinil Agarwal - Portfolio Website

A modern, responsive portfolio website built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎨 Modern UI with smooth animations
- 📱 Fully responsive design
- ⚡ Lightning-fast performance with Vite
- 🎯 TypeScript for type safety
- 🎨 Tailwind CSS for styling
- 🌐 Web3/Blockchain focused portfolio

## Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (or yarn/npm)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio-app
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the development server:
```bash
pnpm dev
```

4. Build for production:
```bash
pnpm build
```

5. Preview production build:
```bash
pnpm preview
```

## Project Structure

```
portfolio-app/
├── src/
│   ├── components/
│   │   ├── Navigation/
│   │   ├── Hero/
│   │   ├── Experience/
│   │   ├── Tools/
│   │   ├── Projects/
│   │   ├── Blog/
│   │   ├── Contact/
│   │   └── Footer/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Sections

- **Hero:** Introduction with profile card and statistics
- **Experience:** Professional work history
- **Tools:** Technologies and frameworks
- **Projects:** Personal and professional projects
- **Blog:** Engineering thoughts and articles
- **Contact:** Contact form for collaboration
- **Footer:** Credits and links

## Customization

### Colors

Update the color scheme in `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      primary: '#151312',
      secondary: '#fff',
      tertiary: '#998f8f',
      accent: '#c5ff41',
      orange: '#f46c38',
      gray: '#6a6b6e',
    },
  },
}
```

### Content

Update content in respective component files under `src/components/`.

## License

MIT

## Credits

- Design inspired by modern portfolio templates
- Icons by Lucide React
- Fonts: Poppins & Inter from Google Fonts
