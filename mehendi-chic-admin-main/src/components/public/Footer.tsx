import { Instagram, MessageCircle, Facebook, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: MessageCircle, href: 'https://wa.me/1234567890', label: 'WhatsApp' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <h2 className="font-display text-4xl font-bold text-accent mb-4">AM</h2>
          <p className="text-primary-foreground/70 max-w-md mb-8">
            Creating beautiful mehendi designs for your special moments. 
            From bridal to festive, we bring art to your hands.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-6 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-primary-foreground/20 text-primary-foreground/70 hover:text-accent hover:border-accent transition-all duration-300 hover:scale-110"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-24 h-px bg-accent/50 mb-6" />

          {/* Copyright */}
          <p className="text-primary-foreground/50 text-sm flex items-center gap-1">
            © {currentYear} AM Mehendi. Made with{' '}
            <Heart className="w-4 h-4 text-accent fill-accent" /> All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
