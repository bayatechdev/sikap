import { Skeleton } from '@/components/ui/skeleton';

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>

      {/* Table Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 w-full" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
        <Skeleton className="h-4 w-[60%]" />
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[120px]" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-[80px]" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[80px]" />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>
      <Skeleton className="h-10 w-[120px]" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-6 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded" />
          </div>
          <Skeleton className="h-8 w-[60px]" />
          <Skeleton className="h-3 w-[120px]" />
        </div>
      ))}
    </div>
  );
}

export function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="rounded-md border">
        <div className="border-b px-4 py-3">
          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
        </div>
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div key={rowIndex} className="border-b px-4 py-3 last:border-b-0">
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FullPageSkeleton() {
  return (
    <div className="@container/main space-y-6">
      <PageHeaderSkeleton />
      <StatsSkeleton />
      <DataTableSkeleton />
    </div>
  );
}

export function CenterLoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[160px]" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 w-20" />
          <Skeleton className="h-20 w-20" />
          <Skeleton className="h-20 w-20" />
        </div>
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <header className="bg-section w-full pb-[70px] pt-[200px]">
      <div className="relative flex justify-center">
        <div className="flex flex-col gap-[30px] px-4 md:px-[75px] max-w-[1280px] w-full">
          {/* Main Hero Content */}
          <div className="flex flex-col lg:flex-row gap-[30px]">
            {/* Left Content Skeleton */}
            <div className="flex flex-col gap-[30px] w-full lg:w-[550px] shrink-0 py-8 lg:py-[92px]">
              {/* Title Skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-12 md:h-16 w-full max-w-[500px] bg-gray-200/70 animate-pulse" />
                <Skeleton className="h-12 md:h-16 w-[80%] max-w-[400px] bg-gray-200/70 animate-pulse" />
              </div>

              {/* Subtitle Skeleton */}
              <div className="space-y-2 max-w-[484px]">
                <Skeleton className="h-6 w-full bg-gray-300/60 animate-pulse" />
                <Skeleton className="h-6 w-[90%] bg-gray-300/60 animate-pulse" />
                <Skeleton className="h-6 w-[70%] bg-gray-300/60 animate-pulse" />
              </div>

              {/* Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-3.5">
                <div className="h-[60px] w-[180px] rounded-[100px] bg-primary/30 animate-pulse"></div>
                <div className="h-[60px] w-[140px] rounded-[100px] bg-gray-300/50 border-2 border-gray-300/40 animate-pulse"></div>
              </div>
            </div>

            {/* Right Content Skeleton */}
            <div className="relative shrink-0 w-full lg:w-[550px] h-[400px] lg:h-[507px]">
              {/* Main image skeleton */}
              <div className="absolute ml-4 mr-4 lg:ml-[52px] lg:mr-[51px] w-[calc(100%-32px)] lg:w-[447px] h-full lg:h-[506px] rounded-[26px] overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
              </div>

              {/* Review card skeleton */}
              <div className="absolute bottom-[20px] lg:bottom-[68px] left-0 w-[200px] lg:w-[316px] h-[80px] lg:h-[150px] z-10">
                <div className="w-full h-full rounded-lg bg-white/80 shadow-lg animate-pulse"></div>
              </div>

              {/* Badge skeleton */}
              <div className="absolute top-[20px] lg:top-[77px] right-0 w-[80px] lg:w-[136px] h-[60px] lg:h-[120px] z-10">
                <div className="w-full h-full rounded-lg bg-white/80 shadow-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Partners Section Skeleton */}
          <div className="flex flex-col gap-[30px] items-center mt-16">
            <Skeleton className="h-8 md:h-10 w-[200px] md:w-[300px] bg-gray-200/70 animate-pulse" />
            <div className="flex w-full justify-center gap-8 lg:gap-[70px] h-[42px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 h-full max-w-[100px] bg-gray-200/50 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}