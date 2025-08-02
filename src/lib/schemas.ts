import { z } from "zod";

export const measurementSchema = z.object({
  name: z.string().min(1, "Measurement name is required."),
  value: z.coerce.number().min(0, "Measurement must be a non-negative number."),
});

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be a non-negative number."),
});

export const invoiceSchema = z.object({
  customerName: z.string().min(2, "Customer name must be at least 2 characters."),
  customerPhone: z.string().min(10, "A valid phone number is required.").max(15, "Phone number is too long."),
  invoiceDate: z.date({ required_error: "Invoice date is required." }),
  deliveryDate: z.date({ required_error: "Delivery date is required." }),
  services: z.array(serviceSchema).min(1, "At least one service is required."),
  measurements: z.array(measurementSchema).optional(),
  advance: z.coerce.number().min(0, "Advance must be a non-negative number.").optional().default(0),
  notes: z.string().optional(),
});

export type Invoice = z.infer<typeof invoiceSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Measurement = z.infer<typeof measurementSchema>;
