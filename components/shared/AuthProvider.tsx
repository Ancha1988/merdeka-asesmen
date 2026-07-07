"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAllowed, isLoading, setUser, setLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "allowed_users", firebaseUser.email || "");
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUser(firebaseUser, data.role === "admin", true);
          } else {
            setUser(firebaseUser, false, false);
          }
        } catch (error) {
          console.error("Error fetching user role", error);
          setUser(firebaseUser, false, false);
        }
      } else {
        setUser(null, false, false);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  useEffect(() => {
    if (!isLoading) {
      if (!user || !isAllowed) {
        if (pathname !== "/login") {
          router.push("/login");
        }
      } else {
        if (pathname === "/login") {
          router.push("/");
        }
      }
    }
  }, [user, isAllowed, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!user || !isAllowed) {
    return null;
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
