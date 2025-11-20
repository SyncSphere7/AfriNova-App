import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  className?: string;
  text?: string;
}

export function LoadingSpinner({ className, text = 'LOADING...' }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="animate-pulse text-lg font-pixel uppercase">{text}</div>
    </div>
  );
}
