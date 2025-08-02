"use client";

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

interface InvoicePreviewProps {
  data: Invoice;
  total: number;
  balance: number;
}

export function InvoicePreview({ data, total, balance }: InvoicePreviewProps) {
  return (
    <Card className="shadow-none border-border invoice-print-area">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
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
             <h2 className="font-headline font-bold text-xl">BoutiqueBill</h2>
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
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {service.name}
                  {service.description && <p className="text-xs text-muted-foreground">{service.description}</p>}
                </TableCell>
                <TableCell className="text-right">₹{Number(service.price).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="font-bold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">₹{total.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Advance Paid</TableCell>
              <TableCell className="text-right">₹{Number(data.advance || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow className="text-lg font-bold text-primary bg-muted/50">
              <TableCell>Balance Due</TableCell>
              <TableCell className="text-right">₹{balance.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        <div className="p-6 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.measurements && data.measurements.length > 0 && data.measurements.some(m => m.value > 0) && (
              <div>
                <h4 className="font-semibold font-headline mb-2">Measurements (inches):</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {data.measurements.map((m, i) => (
                    m.value > 0 && <li key={i}>
                      <span className="font-medium">{m.name}:</span> {m.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.notes && (
              <div>
                <h4 className="font-semibold font-headline mb-2">Notes:</h4>
                <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
