import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeStyles = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

interface SpinnerProps {
  size?: keyof typeof sizeStyles;
  className?: string;
}

export default function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className={cn('animate-spin text-muted-foreground', sizeStyles[size], className)} />
    </div>
  );
}
