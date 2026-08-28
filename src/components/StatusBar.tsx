import { useCompilerStore } from '@/store/compilerStore'

export function StatusBar() {
  const status = useCompilerStore((state) => state.status)

  const statusColors = {
    idle: 'bg-text-muted',
    running: 'bg-warning',
    success: 'bg-success',
    error: 'bg-error',
  }

  return (
    <footer className="h-8 bg-bg-secondary border-t border-border-primary px-4 flex items-center justify-between text-xs text-text-muted font-mono shrink-0">
      <div className="flex items-center space-x-4">
        <span className="flex items-center" role="status" aria-live="polite">
          <span
            className={`w-2 h-2 rounded-full mr-2 ${statusColors[status]}`}
          ></span>
          Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        <span>Line 1, Col 1</span>
      </div>
      <div>
        <span>WASM: Ready</span>
      </div>
    </footer>
  )
}
