// Shown instantly on navigation to an asset while the server fetches data,
// so a click never feels like nothing happened.
export default function AssetLoading() {
  return (
    <div className="space-y-6 p-6" aria-busy>
      <div className="h-4 w-40 animate-pulse bg-panel" />

      <div className="term-panel p-5">
        <div className="grad-rule absolute inset-x-0 top-0" />
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 animate-pulse border border-edge bg-panel" />
          <div className="space-y-2">
            <div className="h-4 w-52 animate-pulse bg-panel" />
            <div className="h-3 w-32 animate-pulse bg-panel" />
          </div>
        </div>
      </div>

      <div className="term-panel p-5">
        <div className="flex flex-wrap gap-2">
          {[80, 64, 56, 72, 60].map((w, i) => (
            <span key={i} className="h-7 animate-pulse border border-edge bg-panel" style={{ width: w }} />
          ))}
        </div>
      </div>

      <div className="term-panel p-5">
        <div className="flex items-center gap-2 text-sm text-dim">
          <span className="cursor" /> loading asset…
        </div>
      </div>
    </div>
  );
}
