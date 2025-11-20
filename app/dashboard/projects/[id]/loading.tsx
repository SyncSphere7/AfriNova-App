import { LoadingSpinner } from '@/components/shared/loading-spinner';

export default function ProjectLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner text="LOADING PROJECT..." />
    </div>
  );
}
