import Link from 'next/link';
import { Gamepad2, Github, Twitter, Youtube, MessageCircle } from 'lucide-react';

const FOOTER_LINKS = {
  Product: [
    { label: 'Create Games', href: '/create/chat' },
    { label: 'Templates', href: '/create/template' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Tutorials', href: '/learn' },
    { label: 'API Reference', href: '/api-docs' },
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About CR AudioViz AI', href: 'https://craudiovizai.com/about' },
    { label: 'Careers', href: 'https://craudiovizai.com/careers' },
    { label: 'Contact', href: 'https://craudiovizai.com/contact' },
    { label: 'Press Kit', href: 'https://craudiovizai.com/press' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Creator Agreement', href: '/creator-agreement' },
    { label: 'DMCA', href: '/dmca' },
  ],
};

const SOCIAL_LINKS = [
  { icon: Twitter, href: 'https://twitter.com/craudiovizai', label: 'Twitter' },
  { icon: Youtube, href: 'https://youtube.com/@craudiovizai', label: 'YouTube' },
  { icon: Github, href: 'https://github.com/CR-AudioViz-AI', label: 'GitHub' },
  { icon: MessageCircle, href: 'https://discord.gg/craudiovizai', label: 'Discord' },
];

export function Footer() {
  return (
    <footer className="bg-black/50 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-lg">CR Game Studio</div>
                <div className="text-xs text-gray-400">by CR AudioViz AI</div>
              </div>
            </Link>
            <p className="text-gray-400 text-sm mb-4">
              Build any game by describing it in plain English. Powered by Javari AI with 11 AI brains.
            </p>
            <div className="flex gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label={link.label}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} CR AudioViz AI, LLC. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            "Your Story. Our Design." • "Everyone connects. Everyone wins."
          </p>
        </div>
      </div>
    </footer>
  );
}
