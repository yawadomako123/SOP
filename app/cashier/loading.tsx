export default function CashierLoading() {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header placeholder */}
      <div className="bg-primary h-[61px] shadow-md" />

      <div className="flex-1 flex overflow-hidden animate-pulse">
        {/* Product grid skeleton */}
        <div className="flex-1 p-6 space-y-4">
          {/* Search bars */}
          <div className="h-12 bg-muted rounded-lg" />
          <div className="h-12 bg-muted/70 rounded-lg" />

          {/* Product cards */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 mt-2">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="h-4 w-3/4 bg-muted rounded" />
                <div className="h-3 w-1/2 bg-muted/60 rounded" />
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-muted rounded" />
                  <div className="h-4 w-12 bg-muted/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart sidebar skeleton */}
        <div className="w-105 bg-card border-l border-border p-6 space-y-4">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-20 bg-muted/60 rounded" />
          <div className="flex-1 space-y-3 mt-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-muted/40 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
