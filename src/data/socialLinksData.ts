import githubIcon from '../assets/socials/github.jpeg';
import linkedinIcon from '../assets/socials/linkedin_logo.jpeg';
import twitterIcon from '../assets/socials/twitterX.png';
import gmailIcon from '../assets/socials/gmail.png';
import instagramIcon from '../assets/socials/instagram.jpeg';
import hackernoon from '../assets/socials/hackernoon.png';
import medium from '../assets/socials/medium.png';

export interface SocialLink {
  icon: string;
  href: string;
  label: string;
  color: string; // Gradient color for hover effect
}

export const socialLinksData: SocialLink[] = [
  { icon: githubIcon, href: 'https://github.com/t-phoenix', label: 'GitHub', color: '#333' },
  { icon: linkedinIcon, href: 'https://www.linkedin.com/in/abhinil-agarwal-975374145/', label: 'LinkedIn', color: '#0077B5' },
  { icon: twitterIcon, href: 'https://x.com/touchey_phoenix', label: 'Twitter', color: '#1DA1F2' },
  { icon: gmailIcon, href: 'abhijaipur2011@gmail.com', label: 'Email', color: '#EA4335' },
  { icon: instagramIcon, href: 'https://www.instagram.com/abhi_nahhi/', label: 'Instagram', color: '#E4405F' },
  {icon: hackernoon, href: 'https://hackernoon.com/u/tphoenix', label: 'Hackernoon', color: '#000000' },
  {icon: medium, href: 'https://medium.com/@tphoenix', label: 'Medium', color: '#000000' },
];

