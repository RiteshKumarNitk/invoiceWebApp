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
    <Card className="shadow-none border-border">
      <CardHeader className="bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-headline text-3xl font-bold text-primary">
              INVOICE
            </h1>
            <p className="text-muted-foreground">
              Invoice Date: {format(data.invoiceDate, "PPP")}
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
                <p>{format(data.deliveryDate, "PPP")}</p>
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
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell className="text-right">₹{service.price.toFixed(2)}</TableCell>
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
              <TableCell className="text-right">₹{(data.advance || 0).toFixed(2)}</TableCell>
            </TableRow>
            <TableRow className="text-lg font-bold text-primary bg-muted/50">
              <TableCell>Balance Due</TableCell>
              <TableCell className="text-right">₹{balance.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
        {(data.measurements || data.notes) && <div className="p-6 border-t">
          {data.measurements && (
            <div className="mb-4">
              <h4 className="font-semibold font-headline mb-2">Measurements:</h4>
              <p className="text-sm whitespace-pre-wrap">{data.measurements}</p>
            </div>
          )}
          {data.notes && (
            <div>
              <h4 className="font-semibold font-headline mb-2">Notes:</h4>
              <p className="text-sm whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </div>}
      </CardContent>
    </Card>
  );
}
