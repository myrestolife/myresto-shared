export default function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
      <div className={`${s} border-2 border-[var(--color-border)] border-t-[var(--color-accent)] rounded-full animate-spin`} />
    </div>
  );
}
