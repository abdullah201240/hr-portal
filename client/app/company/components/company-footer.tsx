import { cn } from '@/lib/utils';

type CompanyFooterProps = {
  className?: string;
};

export function CompanyFooter({ className }: CompanyFooterProps) {
  return (
    <footer className={cn("py-4 px-6 border-t border-border bg-background/80 backdrop-blur-sm", className)}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} HR Portal. All rights reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Contact Support</a>
        </div>
      </div>
    </footer>
  );
}