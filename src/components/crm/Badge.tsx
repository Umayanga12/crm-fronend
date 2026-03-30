import { cn } from '@/lib/utils';

const variantStyles = {
  success: 'bg-success/10 text-success',
  info: 'bg-info/10 text-info',
  danger: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
  gray: 'bg-secondary text-muted-foreground',
  purple: 'bg-badge-purple/10 text-badge-purple',
};

interface BadgeProps {
  label: string;
  variant?: keyof typeof variantStyles;
  className?: string;
}

export default function Badge({ label, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
      variantStyles[variant],
      className
    )}>
      {label}
    </span>
  );
}
