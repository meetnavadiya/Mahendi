import { Trash2, Mail, Phone, MessageSquare, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/context/AdminContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

export function ContactTable() {
  const { contacts, deleteContact, isLoggedIn } = useAdmin();

  if (contacts.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-xl shadow-card">
        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">
          No contact submissions yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden bg-card rounded-xl shadow-card">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Message</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
              {isLoggedIn && (
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Action</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contacts.map((contact, index) => (
              <tr
                key={contact.id}
                className="hover:bg-muted/30 transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  {contact.name}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors">
                    {contact.email}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  <a href={`tel:${contact.phone}`} className="hover:text-accent transition-colors">
                    {contact.phone}
                  </a>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                  {contact.message}
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
                </td>
                {isLoggedIn && (
                  <td className="px-6 py-4 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-card border-border">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">Delete Contact</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this contact submission from {contact.name}?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-muted-foreground">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteContact(contact.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {contacts.map((contact, index) => (
          <div
            key={contact.id}
            className="bg-card rounded-xl shadow-card p-4 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-display font-semibold text-foreground text-lg">
                {contact.name}
              </h3>
              {isLoggedIn && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="ghost" className="hover:bg-destructive/10 hover:text-destructive -mr-2 -mt-2">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-display">Delete Contact</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this contact submission from {contact.name}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-muted-foreground">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteContact(contact.id)}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-accent" />
                <a href={`mailto:${contact.email}`} className="hover:text-accent transition-colors">
                  {contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-accent" />
                <a href={`tel:${contact.phone}`} className="hover:text-accent transition-colors">
                  {contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-accent" />
                {format(new Date(contact.createdAt), 'MMM dd, yyyy')}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">{contact.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
