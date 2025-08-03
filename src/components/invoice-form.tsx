"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Image from "next/image";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  CalendarIcon,
  PlusCircle,
  Trash2,
  Send,
  Printer,
  ArrowLeft,
  ArrowRight,
  CheckIcon,
  Ruler,
  Camera,
  Upload,
  ImagePlus,
  Loader2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";


const steps = [
  { id: "your-info", title: "Your Details", fields: ["boutiqueName", "boutiqueAddress", "boutiqueGst", "invoiceNumber"] },
  {
    id: "customer-info",
    title: "Customer Info",
    fields: ["customerName", "customerPhone", "invoiceDate", "deliveryDate"],
  },
  { id: "services", title: "Services & Measurements", fields: ["services"] },
  { id: "details", title: "Notes & Payment", fields: ["notes", "advance"] },
  { id: "preview", title: "Preview & Send" },
];

const measurementOptions = [
  "Length", "Chest", "Waist", "Hip", "Shoulder", "Sleeve Length", "Sleeve Opening", "Armhole", "Neck Front", "Neck Back", "Kurta Length", "Salwar Length"
];

const LogoUploadDialog = ({ setValue, initialImage }: { setValue: any, initialImage?: string }) => {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageSrc(dataUrl);
        setValue('boutiqueLogo', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDone = () => {
    setOpen(false);
  };
  
  const handleRemoveImage = () => {
      setImageSrc(null);
      setValue('boutiqueLogo', undefined);
  }

  return (
     <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ImagePlus className="mr-2 h-4 w-4" />
          {imageSrc ? 'Change Logo' : 'Upload Logo'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Boutique Logo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
            <>
                {imageSrc && (
                    <div className="relative">
                        <Image src={imageSrc} alt="Boutique Logo" width={400} height={300} className="rounded-md w-full object-contain" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={handleRemoveImage}>
                           <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
                <div className="flex gap-2">
                    <Button asChild className="flex-1">
                        <label>
                            <Upload className="mr-2 h-4 w-4" /> Upload Logo
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
                        </label>
                    </Button>
                </div>
            </>
        </div>
        <DialogFooter>
            <Button onClick={handleDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};


const MeasurementDialog = ({ control, serviceIndex, serviceName }: { control: any, serviceIndex: number, serviceName: string }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `services.${serviceIndex}.measurements`,
  });
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Ruler className="mr-2 h-4 w-4" />
          Measurements ({fields.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Measurements for {serviceName || 'Service'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Label>Measurements (inches)</Label>
            <div className="space-y-4 mt-2 max-h-80 overflow-y-auto pr-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-2">
                  <Controller
                    control={control}
                    name={`services.${serviceIndex}.measurements.${index}.name`}
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
                  <Controller
                    control={control}
                    name={`services.${serviceIndex}.measurements.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Value"
                            {...field}
                            className="w-24"
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
                    onClick={() => remove(index)}
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
              onClick={() => append({ name: "Length", value: 0 })}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Measurement
            </Button>
          </div>
          <div className="flex flex-col items-center">
            <Label className="mb-2">Measurement Guide</Label>
            <div className="relative w-full max-w-xs">
              <Image
                src="https://placehold.co/600x800.png"
                alt="Blouse measurement guide"
                width={250}
                height={333}
                className="rounded-lg border"
                data-ai-hint="blouse measurement diagram"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">Visual guide for common measurements.</p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

const ImageDialog = ({ setValue, serviceIndex, initialImage }: { setValue: any, serviceIndex: number, initialImage?: string }) => {
  const [open, setOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(initialImage || null);
  const { toast } = useToast();
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    if (open && isCapturing) {
      const getCameraPermission = async () => {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera not supported');
          }
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
          setIsCapturing(false);
        }
      };
      getCameraPermission();

      return () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  }, [open, isCapturing, toast]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setImageSrc(dataUrl);
      setValue(`services.${serviceIndex}.image`, dataUrl);
      setIsCapturing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setImageSrc(dataUrl);
        setValue(`services.${serviceIndex}.image`, dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDone = () => {
    setOpen(false);
    setIsCapturing(false);
  };
  
  const handleRemoveImage = () => {
      setImageSrc(null);
      setValue(`services.${serviceIndex}.image`, undefined);
  }

  return (
     <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="mr-2 h-4 w-4" />
          {imageSrc ? 'View Image' : 'Add Image'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reference Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {isCapturing ? (
            <div>
              <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
              {!hasCameraPermission && (
                 <Alert variant="destructive" className="mt-2">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                 </Alert>
              )}
              <div className="flex justify-center gap-4 mt-4">
                  <Button onClick={handleCapture} disabled={!hasCameraPermission}>Capture</Button>
                  <Button onClick={() => setIsCapturing(false)} variant="outline">Cancel</Button>
              </div>
            </div>
          ) : (
             <>
                {imageSrc && (
                    <div className="relative">
                        <Image src={imageSrc} alt="Reference" width={400} height={300} className="rounded-md w-full object-contain" />
                        <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={handleRemoveImage}>
                           <Trash2 className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
                <div className="flex gap-2">
                    <Button onClick={() => setIsCapturing(true)} className="flex-1">
                        <Camera className="mr-2 h-4 w-4" /> Use Camera
                    </Button>
                    <Button asChild className="flex-1">
                        <label>
                            <Upload className="mr-2 h-4 w-4" /> Upload File
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="sr-only" />
                        </label>
                    </Button>
                </div>
            </>
          )}
        </div>
        <DialogFooter>
            <Button onClick={handleDone}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
};

export function InvoiceForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const { toast } = useToast();

  const form = useForm<Invoice>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      boutiqueName: "Anjali's Creations",
      boutiqueAddress: "123 Fashion St, New Delhi",
      boutiqueLogo: '',
      boutiqueGst: '',
      invoiceNumber: `INV-${Date.now()}`,
      invoiceDate: new Date(),
      deliveryDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      customerName: "",
      customerPhone: "",
      services: [{ name: "", description: "", price: 0, measurements: [] }],
      advance: 0,
      notes: "",
    },
    mode: "onChange",
  });

  const { control, getValues, watch, setValue } = form;

  const { fields: serviceFields, append: appendService, remove: removeService } = useFieldArray({
    control: control,
    name: "services",
  });

  const watchedServices = watch("services");
  const watchedAdvance = watch("advance");

  const { total, balance } = useMemo(() => {
    const currentTotal = watchedServices.reduce((sum, service) => sum + (Number(service.price) || 0), 0);
    const currentBalance = currentTotal - (Number(watchedAdvance) || 0);
    return { total: currentTotal, balance: currentBalance };
  }, [watchedServices, watchedAdvance]);

  const generateWhatsappMessage = (data: Invoice) => {
    const currentTotal = data.services.reduce((sum, service) => sum + (Number(service.price) || 0), 0);
    const currentBalance = currentTotal - (Number(data.advance) || 0);

    const servicesText = data.services
        .map(s => {
          let serviceStr = `${s.name}${s.description ? ` (${s.description})` : ''} - ₹${(Number(s.price) || 0).toFixed(2)}`;
          if (s.measurements && s.measurements.filter(m => m.value && Number(m.value) > 0).length > 0) {
            const measurementsText = s.measurements.filter(m => m.value && Number(m.value) > 0).map(m => `${m.name}: ${m.value}"`).join(', ');
            serviceStr += `\n  Measurements: ${measurementsText}`;
          }
          return serviceStr;
        })
        .join('\n');

    return `Hello ${data.customerName},

Here are your order details from ${data.boutiqueName}:
${servicesText}

Total Amount: ₹${currentTotal.toFixed(2)}
Advance Paid: ₹${(Number(data.advance) || 0).toFixed(2)}
Balance Due: ₹${currentBalance.toFixed(2)}

Your order will be ready for delivery on ${data.deliveryDate ? format(data.deliveryDate, "PPP") : 'a future date'}.

Thank you,
${data.boutiqueName}`;
  };
  
  const updateWhatsappMessage = () => {
    const data = getValues();
    setWhatsappMessage(generateWhatsappMessage(data));
  }

  useEffect(() => {
    const subscription = watch(() => updateWhatsappMessage());
    return () => subscription.unsubscribe();
  }, [watch, getValues]);

  const nextStep = async () => {
    const fieldsToValidate = steps[currentStep].fields;
    // @ts-ignore
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid) {
      if (currentStep === steps.length - 2) { // When moving to preview
        updateWhatsappMessage();
      }
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };
  
  const handlePrint = async () => {
    setIsDownloading(true);
    const invoiceElement = document.querySelector(".invoice-print-area-container .invoice-display-area") as HTMLElement;

    if (!invoiceElement) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not find invoice to download.",
        });
        setIsDownloading(false);
        return;
    }

    try {
        const canvas = await html2canvas(invoiceElement, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
            orientation: "p",
            unit: "mm",
            format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth - 20; // with margin
        let imgHeight = imgWidth / ratio;

        if (imgHeight > pdfHeight - 20) {
            imgHeight = pdfHeight - 20;
            imgWidth = imgHeight * ratio;
        }

        const x = (pdfWidth - imgWidth) / 2;
        const y = 10; // top margin

        pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        pdf.save(`invoice-${getValues("invoiceNumber")}.pdf`);
    } catch (error) {
        console.error("Error generating PDF:", error);
        toast({
            variant: "destructive",
            title: "PDF Generation Failed",
            description: "An error occurred while creating the PDF file.",
        });
    } finally {
        setIsDownloading(false);
    }
  };

  const handleWhatsApp = () => {
    const phone = getValues("customerPhone");
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
    <>
      <Card className="shadow-lg no-print">
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
          <form onSubmit={(e) => e.preventDefault()}>
            <CardContent className="space-y-8 py-8">
              {currentStep === 0 && (
                  <div className="grid md:grid-cols-2 gap-6 animate-in fade-in-0 duration-500">
                      <FormField
                          control={control}
                          name="boutiqueName"
                          render={({ field }) => (
                              <FormItem className="md:col-span-2">
                              <FormLabel>Boutique Name</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g. Anjali's Creations" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      <FormField
                          control={control}
                          name="boutiqueAddress"
                          render={({ field }) => (
                              <FormItem className="md:col-span-2">
                              <FormLabel>Boutique Address</FormLabel>
                              <FormControl>
                                  <Textarea placeholder="e.g. 123 Fashion St, New Delhi" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                        />
                         <FormField
                          control={control}
                          name="invoiceNumber"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Invoice Number</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g. INV-001" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                        <FormField
                          control={control}
                          name="boutiqueGst"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>GST Number (Optional)</FormLabel>
                              <FormControl>
                                  <Input placeholder="e.g. 29ABCDE1234F1Z5" {...field} />
                              </FormControl>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <div className="md:col-span-2">
                              <FormLabel>Boutique Logo</FormLabel>
                              <div className="mt-2 flex items-center gap-4">
                                <LogoUploadDialog setValue={setValue} initialImage={getValues('boutiqueLogo')} />
                                {watch('boutiqueLogo') && <Image src={watch('boutiqueLogo')} alt="Boutique Logo" width={60} height={60} className="rounded-md object-contain border p-1" />}
                              </div>
                          </div>
                  </div>
              )}
              {currentStep === 1 && (
                <div className="grid md:grid-cols-2 gap-6 animate-in fade-in-0 duration-500">
                  <FormField
                    control={control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Customer Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Priya Singh" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
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
                    control={control}
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
                    control={control}
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
              
              {currentStep === 2 && (
                <div className="animate-in fade-in-0 duration-500">
                  <FormLabel>Services</FormLabel>
                  <div className="space-y-4 mt-2">
                    {serviceFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-start p-4 border rounded-md">
                        <FormField
                          control={control}
                          name={`services.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Service</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Blouse Stitching" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={control}
                          name={`services.${index}.description`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. with lining" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                            control={control}
                            name={`services.${index}.price`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (₹)</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Price"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        <div className="flex gap-2 items-end md:col-span-5 justify-end">
                          <MeasurementDialog control={control} serviceIndex={index} serviceName={watch(`services.${index}.name`)} />
                          <ImageDialog setValue={form.setValue} serviceIndex={index} initialImage={getValues(`services.${index}.image`)} />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeService(index)}
                            disabled={serviceFields.length <= 1}
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
                    onClick={() => appendService({ name: "", description: "", price: 0, measurements: [] })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Service
                  </Button>
                  <FormField
                    control={control}
                    name="services"
                    render={() => (
                      <FormItem>
                        <FormMessage className="mt-2"/>
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="grid md:grid-cols-2 gap-8 animate-in fade-in-0 duration-500">
                  <div>
                    <FormField
                      control={control}
                      name="advance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Advance Paid (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="mt-6">
                      <FormField
                        control={control}
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
                  <div className="flex flex-col items-center justify-center bg-muted/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Summary</h3>
                    <div className="w-full space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Amount:</span>
                        <span className="font-medium">₹{total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Advance Paid:</span>
                        <span className="font-medium">₹{(Number(watchedAdvance) || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-primary">
                        <span>Balance Due:</span>
                        <span>₹{balance.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-8 animate-in fade-in-0 duration-500">
                   <div className="invoice-display-area">
                      <InvoicePreview data={getValues()} total={total} balance={balance} />
                   </div>
                  <div>
                    <Label htmlFor="whatsapp-message">WhatsApp Message</Label>
                    <Textarea 
                        id="whatsapp-message"
                        value={whatsappMessage}
                        onChange={(e) => setWhatsappMessage(e.target.value)}
                        rows={10}
                        className="mt-2"
                      />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button type="button" onClick={handlePrint} size="lg" variant="outline" className="w-full sm:w-auto" disabled={isDownloading}>
                          {isDownloading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Printer className="mr-2 h-5 w-5" />}
                          {isDownloading ? "Downloading..." : "Download PDF"}
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
      <div className="invoice-print-area-container hidden">
        <div className="invoice-display-area">
            <InvoicePreview data={getValues()} total={total} balance={balance}/>
        </div>
      </div>
    </>
  );
}

    