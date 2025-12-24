import { useAdmin } from '@/context/AdminContext';
import { CategoryGrid } from '@/components/public/CategoryGrid';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const { categories } = useAdmin();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full bg-primary/10 blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Professional Mehendi Artist</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Elegant Mehendi Designs
            <br />
            <span className="text-accent">For Your Special Day</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Transform your celebrations with intricate, beautiful mehendi artistry. 
            From bridal designs to festive patterns, we create memories on your hands.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Link to="/categories">
              <Button size="lg" className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
                Explore Designs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/contact-us">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Book Appointment
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <span className="font-display text-2xl font-bold text-foreground">300+</span>
              </div>
              <span className="text-sm text-muted-foreground">Happy Brides</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Heart className="w-5 h-5 text-accent fill-accent" />
                <span className="font-display text-2xl font-bold text-foreground">8+</span>
              </div>
              <span className="text-sm text-muted-foreground">Years Experience</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sparkles className="w-5 h-5 text-accent" />
                <span className="font-display text-2xl font-bold text-foreground">250+</span>
              </div>
              <span className="text-sm text-muted-foreground">Designs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Mehendi Collections
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Browse through our exclusive collection of mehendi designs. 
              Click on any category to explore the full gallery.
            </p>
          </div>

          <CategoryGrid categories={categories} />

          {categories.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/categories">
                <Button variant="outline" size="lg" className="gap-2 border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                  View All Categories
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary rounded-2xl p-8 lg:p-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-primary-foreground mb-4">
              Ready to Get Beautiful Mehendi?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Book your appointment today and let us create stunning designs for your special occasion.
            </p>
            <Link to="/contact-us">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Contact Us Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
