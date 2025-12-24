import { Crown, Heart, Sparkles, Star, Flower2, Palette } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const services = [
  {
    icon: Crown,
    title: 'Bridal Mehendi',
    description: 'Exquisite full bridal mehendi designs covering hands and feet with intricate patterns, portraits, and traditional motifs for your special day.',
    features: ['Full hands & feet', 'Custom portraits', 'Premium quality'],
  },
  {
    icon: Heart,
    title: 'Engagement Mehendi',
    description: 'Beautiful designs perfect for engagement ceremonies, featuring elegant patterns that complement your outfit and jewelry.',
    features: ['Medium coverage', 'Modern designs', 'Quick application'],
  },
  {
    icon: Sparkles,
    title: 'Arabic Mehendi',
    description: 'Bold and beautiful Arabic style designs with flowing patterns, florals, and geometric shapes for a contemporary look.',
    features: ['Bold strokes', 'Floral patterns', 'Fast drying'],
  },
  {
    icon: Star,
    title: 'Festival Mehendi',
    description: 'Celebrate Karva Chauth, Diwali, Eid, and other festivals with stunning traditional mehendi designs.',
    features: ['Traditional motifs', 'Festive themes', 'All age groups'],
  },
  {
    icon: Flower2,
    title: 'Indo-Western Fusion',
    description: 'A perfect blend of traditional Indian and modern Western elements creating unique and trendy designs.',
    features: ['Unique patterns', 'Contemporary style', 'Minimalist options'],
  },
  {
    icon: Palette,
    title: 'Custom Designs',
    description: 'Get personalized mehendi designs tailored to your preferences, including names, dates, and custom motifs.',
    features: ['Personalized art', 'Custom themes', 'Creative freedom'],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Our Services
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We offer a wide range of mehendi services for all occasions. 
            From bridal to festive, our expert artists create stunning designs 
            that will make your celebration unforgettable.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-card rounded-2xl p-6 lg:p-8 shadow-card hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:bg-accent/20 transition-colors">
                <service.icon className="w-7 h-7 text-accent" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-muted rounded-2xl p-8 lg:p-12 max-w-3xl mx-auto">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              Ready to Book Your Mehendi Session?
            </h2>
            <p className="text-muted-foreground mb-6">
              Contact us today to discuss your requirements and get a personalized quote. 
              We offer home services and studio appointments.
            </p>
            <Link to="/contact-us">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Get in Touch
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
