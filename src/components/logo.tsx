import { cn } from "@/lib/utils";

export function Logo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      aria-label="BoutiqueBill Logo"
      className={cn("fill-current", props.className)}
      {...props}
    >
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M50,5 C25.1,5 5,25.1 5,50 C5,74.9 25.1,95 50,95 C74.9,95 95,74.9 95,50 C95,25.1 74.9,5 50,5 Z M50,15 C69.3,15 85,30.7 85,50 C85,69.3 69.3,85 50,85 C30.7,85 15,69.3 15,50 C15,30.7 30.7,15 50,15 Z"
        fill="url(#grad1)"
      />
      <path
        d="M40,30 C40,24.5 44.5,20 50,20 C55.5,20 60,24.5 60,30 L60,70 C60,75.5 55.5,80 50,80 C44.5,80 40,75.5 40,70 L40,30 Z M50,45 C47.2,45 45,47.2 45,50 C45,52.8 47.2,55 50,55 C52.8,55 55,52.8 55,50 C55,47.2 52.8,45 50,45 Z"
        fill="hsl(var(--card))"
        transform="rotate(30, 50, 50)"
      />
    </svg>
  );
}
