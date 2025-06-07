"use client";

import React, { useState, useEffect } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth as firebaseClientAuth } from '@/lib/firebase';
import { logout as serverLogout } from '@/lib/actions/auth'; // Corrected import

interface FloatingLogoutButtonProps {
  initialIsAuthenticated: boolean;
}

export default function FloatingLogoutButton({ initialIsAuthenticated }: FloatingLogoutButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);
  // Removed currentUser state as it's implicitly handled by isAuthenticated

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseClientAuth, (user) => {
      console.log("[FloatingLogoutButton onAuthStateChanged] Firebase user:", user ? user.uid : null);
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  // Sync with server-provided initial state for the first render, then let onAuthStateChanged take over.
  useEffect(() => {
    console.log("[FloatingLogoutButton] initialIsAuthenticated prop received:", initialIsAuthenticated);
    // This ensures the component uses the prop value until onAuthStateChanged fires for the first time.
    // After that, onAuthStateChanged becomes the source of truth for isAuthenticated.
    if (firebaseClientAuth.currentUser === null) { // Only set if Firebase hasn't determined current user yet
        setIsAuthenticated(initialIsAuthenticated);
    }
  }, [initialIsAuthenticated]);


  const handleLogout = async () => {
    setIsSubmittingLogout(true);
    console.log("[FloatingLogoutButton handleLogout] Attempting logout...");
    try {
      await firebaseClientAuth.signOut();
      console.log("[FloatingLogoutButton handleLogout] Client-side signOut successful.");

      const result = await serverLogout(); // This is the call to the imported function
      console.log("[FloatingLogoutButton handleLogout] serverLogout (cookie deletion) result:", result);

      if (result.success) {
        toast({ title: "Başarıyla çıkış yapıldı." });
      } else {
        toast({ title: "Çıkış Hatası", description: result.error || "Sunucu tarafında çıkış sırasında bir sorun oluştu.", variant: "destructive" });
      }

      // onAuthStateChanged will set isAuthenticated to false, which should hide this button.
      // Refresh to ensure layout and other server components update.
      if (pathname.startsWith('/admin')) {
        router.push('/');
      }
      router.refresh();
    } catch (error) {
      console.error("[FloatingLogoutButton handleLogout] Logout error:", error);
      toast({ title: "Çıkış Hatası", description: "Bir hata oluştu.", variant: "destructive" });
    } finally {
      setIsSubmittingLogout(false);
    }
  };

  console.log("[FloatingLogoutButton Render] isAuthenticated state:", isAuthenticated);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
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
