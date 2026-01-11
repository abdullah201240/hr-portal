import { cn } from '@/lib/utils';

type CompanyFooterProps = {
  className?: string;
};

export function CompanyFooter({ className }: CompanyFooterProps) {
  return (
    <footer className={cn("py-4 px-6 border-t border-border bg-background/80 backdrop-blur-sm", className)}>
      <div className="flex flex-col md:flex-row items-center gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} HR Portal. All rights reserved.
        </p>
       
      </div>
    </footer>
  );
}