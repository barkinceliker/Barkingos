
"use client";

import React, { useState, useEffect } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';
import { auth as firebaseClientAuth } from '@/lib/firebase';
import { logout as serverLogout } from '@/lib/actions/auth'; // checkAuthStatus removed

interface FloatingLogoutButtonProps {
  initialIsAuthenticated: boolean;
}

export default function FloatingLogoutButton({ initialIsAuthenticated }: FloatingLogoutButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);

  const router = useRouter();
  const pathname = usePathname(); // Keep for redirect logic in handleLogout
  const { toast } = useToast();

  useEffect(() => {
    setIsAuthenticated(initialIsAuthenticated);
  }, [initialIsAuthenticated]);

  const handleLogout = async () => {
    setIsSubmittingLogout(true);
    try {
      await firebaseClientAuth.signOut();
      const result = await serverLogout();
      if (result.success) {
        // setIsAuthenticated(false); // No longer needed, prop will update after refresh
        toast({ title: "Başarıyla çıkış yapıldı." });
        if (pathname.startsWith('/admin')) {
          router.push('/');
        }
        router.refresh(); // Important to re-trigger AuthAwareUIComponents in layout.tsx
      } else {
        toast({ title: "Çıkış Hatası", description: result.error || "Çıkış sırasında bir sorun oluştu.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: "Çıkış Hatası", description: "Bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsSubmittingLogout(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]"> {/* Ensure z-index is high enough */}
      <Button
        variant="destructive"
        size="lg"
        onClick={handleLogout}
        disabled={isSubmittingLogout}
        className="shadow-xl rounded-full p-4"
        aria-label="Çıkış Yap"
      >
        {isSubmittingLogout ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <LogOut className="h-6 w-6" />
        )}
        <span className="sr-only sm:not-sr-only sm:ml-2">Çıkış Yap</span>
      </Button>
    </div>
  );
}
