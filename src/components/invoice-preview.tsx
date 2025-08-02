import React from "react";
import type { Invoice } from "@/lib/schemas";
import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Logo } from "./logo";
import { Separator } from "./ui/separator";
import Image from "next/image";

interface InvoicePreviewProps {
  data: Invoice;
  total: number;
  balance: number;
}

export const InvoicePreview = React.forwardRef<HTMLDivElement, InvoicePreviewProps>(({ data, total, balance }, ref) => {
  return (
    <Card className="shadow-none border-border" ref={ref}>
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">
              INVOICE
            </h1>
            <p className="text-muted-foreground">
              Invoice Date: {data.invoiceDate ? format(data.invoiceDate, "PPP") : ''}
            </p>
          </div>
          <div className="text-right">
             <Logo className="h-12 w-12 text-primary mx-auto mb-2"/>
             <h2 className="font-headline font-bold text-xl">{data.boutiqueName}</h2>
             <p className="text-sm text-muted-foreground whitespace-pre-line">{data.boutiqueAddress}</p>
          </div>
        </div>
        <Separator className="my-4"/>
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <h3 className="font-semibold mb-1">Bill To:</h3>
                <p className="font-medium text-primary">{data.customerName}</p>
                <p>Phone: {data.customerPhone}</p>
            </div>
            <div className="text-right">
                <h3 className="font-semibold mb-1">Delivery Date:</h3>
                <p>{data.deliveryDate ? format(data.deliveryDate, "PPP"): ''}</p>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-2/3">Service Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.services.map((service, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell className="font-medium align-top">
                    <div className="flex gap-4">
                       {service.image && <Image src={service.image} alt="Reference" width={60} height={60} className="rounded-md object-cover"/>}
                       <div>
                         <p className="font-bold">{service.name}</p>
                         {service.description && <p className="text-xs text-muted-foreground">{service.description}</p>}
                       </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right align-top">₹{(Number(service.price) || 0).toFixed(2)}</TableCell>
                </TableRow>
                {service.measurements && service.measurements.filter(m => m.value && Number(m.value) > 0).length > 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-2 pl-8">
                       <h4 className="font-semibold text-xs mb-1">Measurements (inches):</h4>
                       <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs">
                         {service.measurements.filter(m => m.value && Number(m.value) > 0).map((m, i) => (
                           <li key={i}>
                             <span className="font-medium">{m.name}:</span> {m.value}
                           </li>
                         ))}
                       </ul>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">₹{total.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Advance Paid</TableCell>
              <TableCell className="text-right">₹{(Number(data.advance) || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow className="text-lg font-bold text-primary bg-muted/50">
              <TableCell>Balance Due</TableCell>
              <TableCell className="text-right">₹{balance.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        {data.notes && (
          <div className="p-6 border-t">
              <div>
                <h4 className="font-semibold font-headline mb-2">Notes:</h4>
                <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
              </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

InvoicePreview.displayName = "InvoicePreview"

    