'use client';

export default function ContentCardSkeleton() {
  return (
    <div className="card animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="bg-background-tertiary -mx-6 -mt-6 mb-4 h-32 rounded-t-xl" />

      {/* Status Badge Skeleton */}
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-background-tertiary h-6 w-20 rounded-full" />
        <div className="bg-background-tertiary h-6 w-16 rounded-full" />
      </div>

      {/* Source Skeleton */}
      <div className="mb-3">
        <div className="bg-background-tertiary h-4 w-3/4 rounded" />
      </div>

      {/* Platforms Skeleton */}
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-background-tertiary h-6 w-6 rounded" />
        <div className="bg-background-tertiary h-6 w-6 rounded" />
        <div className="bg-background-tertiary h-6 w-6 rounded" />
      </div>

      {/* Date Skeleton */}
      <div className="bg-background-tertiary h-3 w-24 rounded" />
    </div>
  );
}
