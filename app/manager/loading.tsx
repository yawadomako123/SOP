export default function ManagerLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded-lg" />
        <div className="h-4 w-64 bg-muted/60 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="w-10 h-10 bg-muted rounded-lg" />
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-4 w-32 bg-muted/60 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
