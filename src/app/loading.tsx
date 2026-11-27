export default function Loading() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-dashed border-primary" aria-label="Loading" />
    </div>
  );
}
