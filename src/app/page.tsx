"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { InvoiceForm } from "@/components/invoice-form";
import { Logo } from "@/components/logo";
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Logo className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <div className="w-full flex justify-between items-center mb-4">
           <div className="w-1/3"></div>
           <Logo className="h-16 w-16" />
           <div className="w-1/3 flex justify-end">
            <Button onClick={logout} variant="outline">Logout</Button>
           </div>
        </div>

        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          BoutiqueBill
        </h1>
        <p className="mt-2 text-lg text-muted-foreground max-w-2xl">
          Effortlessly create beautiful invoices for your boutique. Fill in the details, preview, and send to your clients in minutes.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <InvoiceForm />
      </div>
    </main>
  );
}
