export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-64 bg-muted/60 rounded-lg" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 bg-muted rounded-lg" />
              <div className="h-4 w-10 bg-muted/60 rounded" />
            </div>
            <div className="h-6 w-24 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted/60 rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="h-6 w-36 bg-muted rounded" />
            {[...Array(4)].map((_, j) => (
              <div key={j} className="h-14 bg-muted/50 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
