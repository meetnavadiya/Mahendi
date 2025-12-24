import { ContactTable } from '@/components/admin/ContactTable';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Contact Submissions
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage customer inquiries
          </p>
        </div>

        {/* Contact Table */}
        <ContactTable />
      </div>
    </div>
  );
}
