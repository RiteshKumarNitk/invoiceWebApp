import { InvoiceForm } from "@/components/invoice-form";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col items-center text-center mb-8 md:mb-12">
        <Logo className="h-16 w-16 mb-4" />
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
