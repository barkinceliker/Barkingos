
"use client";

import React, { useState, useEffect } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth as firebaseClientAuth } from '@/lib/firebase';
import { logout as serverLogout } from '@/lib/actions/auth';

interface FloatingLogoutButtonProps {
  initialIsAuthenticated: boolean;
}

export default function FloatingLogoutButton({ initialIsAuthenticated }: FloatingLogoutButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Start as false
  const [isSubmittingLogout, setIsSubmittingLogout] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    // Set initial state based on prop, then let onAuthStateChanged take over
    if (initialIsAuthenticated) {
      setIsAuthenticated(true);
    }

    const unsubscribe = onAuthStateChanged(firebaseClientAuth, (user) => {
      console.log("[FloatingLogoutButton onAuthStateChanged] Firebase user from SDK:", user ? user.uid : null);
      setIsAuthenticated(!!user); // SDK state is the source of truth after mount
    });
    return () => unsubscribe();
  }, [initialIsAuthenticated]); // Effect depends on initialIsAuthenticated for the first setup

  const handleLogout = async () => {
    setIsSubmittingLogout(true);
    console.log("[FloatingLogoutButton handleLogout] Attempting logout...");
    try {
      await firebaseClientAuth.signOut();
      console.log("[FloatingLogoutButton handleLogout] Client-side signOut successful.");

      const result = await serverLogout();
      console.log("[FloatingLogoutButton handleLogout] serverLogout (cookie deletion) result:", result);

      if (result.success) {
        toast({ title: "Başarıyla çıkış yapıldı." });
      } else {
        toast({ title: "Çıkış Hatası", description: result.error || "Sunucu tarafında çıkış sırasında bir sorun oluştu.", variant: "destructive" });
      }

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

  console.log("[FloatingLogoutButton Render] isAuthenticated state:", isAuthenticated, "Initial Prop:", initialIsAuthenticated);

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
