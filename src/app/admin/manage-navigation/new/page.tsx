
import NavItemFormObsolete from '@/components/admin/forms/NavItemForm';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListChecks, AlertTriangle } from 'lucide-react';

export default function NewNavItemPageObsolete() {
  return (
    <div className="space-y-6 p-4 md:p-8">
      <Card className="shadow-md max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle className="text-2xl font-headline text-primary">New Navigation Item Page (Disabled)</CardTitle>
          <CardDescription>
           This page is no longer in use as dynamic navigation management has been removed.
           Navigation items are now statically defined directly in the code (Header.tsx).
          </CardDescription>
        </CardHeader>
         <CardContent className="text-center">
            <Link href="/admin">
              <Button variant="outline">Return to Main Admin Panel</Button>
            </Link>
        </CardContent>
      </Card>
      {/* <NavItemFormObsolete /> // Form is not needed, already non-functional */}
    </div>
  );
}
