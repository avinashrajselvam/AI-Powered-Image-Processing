import React from 'react';
import { BlogIcon } from './icons/BlogIcon';
import { GithubIcon } from './icons/GithubIcon';
import { InstagramIcon } from './icons/InstagramIcon';
import { LinkedInIcon } from './icons/LinkedInIcon';
import { XIcon } from './icons/XIcon';
import { YoutubeIcon } from './icons/YoutubeIcon';

const socialMedia = {
    blog: "https://hereandnowai.com/blog",
    linkedin: "https://www.linkedin.com/company/hereandnowai/",
    instagram: "https://instagram.com/hereandnow_ai",
    github: "https://github.com/hereandnowai",
    x: "https://x.com/hereandnow_ai",
    youtube: "https://youtube.com/@hereandnow_ai"
};

const socialLinks = [
    { href: socialMedia.blog, icon: <BlogIcon className="w-5 h-5" />, name: 'Blog' },
    { href: socialMedia.linkedin, icon: <LinkedInIcon className="w-5 h-5" />, name: 'LinkedIn' },
    { href: socialMedia.instagram, icon: <InstagramIcon className="w-5 h-5" />, name: 'Instagram' },
    { href: socialMedia.github, icon: <GithubIcon className="w-5 h-5" />, name: 'GitHub' },
    { href: socialMedia.x, icon: <XIcon className="w-5 h-5" />, name: 'X' },
    { href: socialMedia.youtube, icon: <YoutubeIcon className="w-5 h-5" />, name: 'YouTube' },
];

export const Footer: React.FC = () => {
  return (
    <footer className="bg-black/30 mt-12 border-t border-brand-primary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left">
            <a href="https://hereandnowai.com" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png" 
                alt="HERE AND NOW AI Logo" 
                className="h-10 mb-2 mx-auto md:mx-0"
              />
            </a>
            <p className="text-sm text-gray-400 italic">designed with passion for innovation</p>
          </div>
          <div className="flex items-center space-x-5">
            {socialLinks.map(link => (
              <a 
                key={link.name} 
                href={link.href} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-brand-primary transition-colors"
                aria-label={link.name}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-brand-primary/20 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} HERE AND NOW AI - Artificial Intelligence Research Institute. All Rights Reserved.</p>
          <p>Developed by Avinash [AI products engineering team]</p>
        </div>
      </div>
    </footer>
  );
};