import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AdminProvider } from "@/context/AdminContext";

// Public pages
import HomePage from "./pages/public/HomePage";
import PublicCategoryPage from "./pages/public/PublicCategoryPage";
import GalleryPage from "./pages/public/GalleryPage";
import ServicesPage from "./pages/public/ServicesPage";
import PublicContactPage from "./pages/public/PublicContactPage";

// Admin pages
import Dashboard from "./pages/Dashboard";
import CategoryPage from "./pages/CategoryPage";
import AddProductPage from "./pages/AddProductPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

// Components
import { PublicNavbar } from "./components/public/PublicNavbar";
import { Footer } from "./components/public/Footer";
import { Navbar } from "@/components/admin/Navbar";

const queryClient = new QueryClient();

// Layout for public pages
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

// Layout for admin pages
function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || 
                       location.pathname === '/category' ||
                       location.pathname === '/add-product' ||
                       location.pathname === '/contact' ||
                       location.pathname === '/login';

  return (
    <>
      {isAdminRoute ? (
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/category" element={<CategoryPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </AdminLayout>
      ) : (
        <PublicLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/categories" element={<PublicCategoryPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/gallery/:categoryId" element={<GalleryPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact-us" element={<PublicContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PublicLayout>
      )}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
