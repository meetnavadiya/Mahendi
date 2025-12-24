import { Link } from 'react-router-dom';
import { FolderOpen, Package, MessageSquare, Leaf, ArrowRight } from 'lucide-react';
import { useAdmin } from '@/context/AdminContext';

export default function Dashboard() {
  const { categories, products, contacts, isLoggedIn } = useAdmin();

  const stats = [
    {
      title: 'Categories',
      count: categories.length,
      icon: FolderOpen,
      link: '/category',
      color: 'bg-primary',
    },
    {
      title: 'Products',
      count: products.length,
      icon: Package,
      link: '/add-product',
      color: 'bg-accent',
    },
    {
      title: 'Inquiries',
      count: contacts.length,
      icon: MessageSquare,
      link: '/contact',
      color: 'bg-mehendi-light',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-background" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-6 animate-fade-in">
            <Leaf className="h-4 w-4" />
            <span className="text-sm font-medium">Admin Panel</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Welcome to <span className="text-accent">Mehendi</span> Admin
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Manage your mehendi designs, categories, and customer inquiries with elegance
          </p>

          {!isLoggedIn && (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-gold hover:bg-mehendi-light transition-all duration-300 animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              Login to Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-10">
            Quick Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Link
                key={stat.title}
                to={stat.link}
                className="group bg-card rounded-xl p-6 shadow-card hover-lift animate-fade-in"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
                </div>
                <h3 className="font-display text-3xl font-bold text-foreground mb-1">
                  {stat.count}
                </h3>
                <p className="text-muted-foreground">{stat.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      {isLoggedIn && (
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground text-center mb-10">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                to="/category"
                className="group flex items-center gap-4 bg-card rounded-xl p-5 shadow-card hover-lift"
              >
                <div className="p-3 rounded-lg bg-primary">
                  <FolderOpen className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                    Manage Categories
                  </h3>
                  <p className="text-sm text-muted-foreground">Add, edit or delete</p>
                </div>
              </Link>

              <Link
                to="/add-product"
                className="group flex items-center gap-4 bg-card rounded-xl p-5 shadow-card hover-lift"
              >
                <div className="p-3 rounded-lg bg-accent">
                  <Package className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                    Add New Product
                  </h3>
                  <p className="text-sm text-muted-foreground">Upload designs</p>
                </div>
              </Link>

              <Link
                to="/contact"
                className="group flex items-center gap-4 bg-card rounded-xl p-5 shadow-card hover-lift"
              >
                <div className="p-3 rounded-lg bg-mehendi-light">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                    View Inquiries
                  </h3>
                  <p className="text-sm text-muted-foreground">{contacts.length} new messages</p>
                </div>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2024 Mehendi Admin. Crafted with elegance.
          </p>
        </div>
      </footer>
    </div>
  );
}
