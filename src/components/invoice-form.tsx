"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import {
  CalendarIcon,
  PlusCircle,
  Trash2,
  Send,
  Printer,
  ArrowLeft,
  ArrowRight,
  CheckIcon,
} from "lucide-react";

import { invoiceSchema, type Invoice } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { InvoicePreview } from "@/components/invoice-preview";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const steps = [
  {
    id: "customer-info",
    title: "Customer Info",
    fields: ["customerName", "customerPhone", "invoiceDate", "deliveryDate"],
  },
  { id: "services", title: "Services", fields: ["services"] },
  { id: "details", title: "Measurements & Notes", fields: ["measurements", "notes", "advance"] },
  { id: "preview", title: "Preview & Send" },
];

const measurementOptions = [
  "Length", "Chest", "Waist", "Hip", "Shoulder", "Sleeve Length", "Sleeve Opening", "Armhole", "Neck Front", "Neck Back"
];

export function InvoiceForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const { toast } = useToast();

  const form = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceDate: new Date(),
      deliveryDate: new Date(),
      customerName: "",
      customerPhone: "",
      services: [{ name: "", description: "", price: 0 }],
      measurements: [{ name: "Length", value: 0 }],
      notes: "",
      advance: 0,
    },
    mode: "onChange",
  });

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: form.control,
    name: "services",
  });
  
  const { fields: measurementFields, append: appendMeasurement, remove: removeMeasurement } = useFieldArray({
    control: form.control,
    name: "measurements",
  });

  const watchedServices = form.watch("services");
  const watchedAdvance = form.watch("advance");

  const total = useMemo(
    () =>
      watchedServices.reduce((sum, service) => sum + Number(service.price || 0), 0),
    [watchedServices]
  );

  const balance = useMemo(
    () => total - Number(watchedAdvance || 0),
    [total, watchedAdvance]
  );

  useEffect(() => {
    const data = form.getValues();
    if (currentStep === 3) {
      const servicesText = data.services.map(s => `${s.name} (₹${s.price})`).join(', ');
      const message = `Hello ${data.customerName},

Here are your order details:
Services: ${servicesText}
Total Amount: ₹${total}
Advance Paid: ₹${data.advance}
Balance Due: ₹${balance}

Your order will be ready for delivery on ${format(data.deliveryDate, "PPP")}.

Thank you,
BoutiqueBill`;
      setWhatsappMessage(message);
    }
  }, [currentStep, form, total, balance]);

  const nextStep = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    const isValid = await form.trigger(fieldsToValidate as any);

    if (isValid) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const phone = form.getValues("customerPhone");
    if (!phone) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Customer phone number is not provided.",
      });
      return;
    }
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(url, "_blank");
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl md:text-3xl text-center">{steps[currentStep].title}</CardTitle>
        <div className="flex justify-center items-center pt-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                  currentStep > index ? "bg-primary text-primary-foreground" :
                  currentStep === index ? "bg-accent text-accent-foreground" : "bg-muted"
                )}
              >
                {currentStep > index ? <CheckIcon className="w-5 h-5" /> : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={cn("w-12 h-1 transition-colors", currentStep > index ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(() => nextStep())}>
          <CardContent className="space-y-8 py-8">
            {currentStep === 0 && (
              <div className="grid md:grid-cols-2 gap-6 animate-in fade-in-0 duration-500">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Anjali Sharma" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Phone (with country code)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 919876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Invoice Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Delivery Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {currentStep === 1 && (
              <div className="animate-in fade-in-0 duration-500">
                <FormLabel>Services</FormLabel>
                <div className="space-y-4 mt-2">
                  {serviceFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start p-4 border rounded-md">
                      <FormField
                        control={form.control}
                        name={`services.${index}.name`}
                        render={({ field }) => (
                          <FormItem>
                             <FormLabel>Service</FormLabel>
                             <FormControl>
                              <Input placeholder="e.g. Blouse Stitching" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`services.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. with lining" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name={`services.${index}.price`}
                            render={({ field }) => (
                              <FormItem className="flex-grow">
                                <FormLabel>Price (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeService(index)}
                            disabled={serviceFields.length <= 1}
                            className="self-end"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => appendService({ name: "", description: "", price: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Service
                </Button>
                 <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                       <FormMessage className="mt-2"/>
                    </FormItem>
                  )}
                />
              </div>
            )}
            
            {currentStep === 2 && (
               <div className="grid md:grid-cols-2 gap-8 animate-in fade-in-0 duration-500">
                <div>
                  <FormLabel>Measurements (inches)</FormLabel>
                  <div className="space-y-4 mt-2">
                    {measurementFields.map((field, index) => (
                      <div key={field.id} className="flex items-center gap-2">
                        <FormField
                          control={form.control}
                          name={`measurements.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="flex-grow">
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select measurement" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {measurementOptions.map(opt => (
                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`measurements.${index}.value`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Value"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                  className="w-28"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => removeMeasurement(index)}
                          disabled={measurementFields.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => appendMeasurement({ name: "Length", value: 0 })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Measurement
                  </Button>
                   <FormField
                      control={form.control}
                      name="measurements"
                      render={() => (
                        <FormItem>
                          <FormMessage className="mt-2" />
                        </FormItem>
                      )}
                    />
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="advance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Advance Paid (₹)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="e.g. 500"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea placeholder="e.g. Use golden thread..." {...field} />
                            </FormControl>
                            <FormDescription>Optional: Any special instructions.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <Label className="mb-2">Measurement Guide</Label>
                    <div className="relative w-full max-w-sm">
                      <Image
                        src="https://placehold.co/600x800.png"
                        alt="Blouse measurement guide"
                        width={300}
                        height={400}
                        className="rounded-lg border"
                        data-ai-hint="blouse measurement diagram"
                      />
                      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-1 rounded">Chest</div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-1 rounded w-20 text-center">Waist</div>
                      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 bg-black/50 text-white text-xs px-1 rounded">Shoulder</div>
                      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 bg-black/50 text-white text-xs px-1 rounded">Sleeve</div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">Visual guide for common blouse measurements.</p>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in-0 duration-500">
                <div className="invoice-print-area">
                  <InvoicePreview data={form.getValues()} total={total} balance={balance} />
                </div>
                <div>
                   <Label htmlFor="whatsapp-message">WhatsApp Message</Label>
                   <Textarea 
                      id="whatsapp-message"
                      value={whatsappMessage}
                      onChange={(e) => setWhatsappMessage(e.target.value)}
                      rows={8}
                      className="mt-2"
                    />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button type="button" onClick={handlePrint} size="lg" variant="outline" className="w-full sm:w-auto">
                        <Printer className="mr-2 h-5 w-5" /> Print / Save PDF
                    </Button>
                    <Button type="button" onClick={handleWhatsApp} size="lg" className="w-full sm:w-auto bg-green-500 hover:bg-green-600">
                        <Send className="mr-2 h-5 w-5" /> Send via WhatsApp
                    </Button>
                </div>
              </div>
            )}

          </CardContent>
          <CardFooter className="flex justify-between">
            {currentStep > 0 && (
              <Button type="button" onClick={prevStep} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="button" onClick={nextStep} className="ml-auto">
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
