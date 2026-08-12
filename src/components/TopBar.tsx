import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';
import { pipeline } from '@/services/PipelineOrchestrator';

export function TopBar() {
  const { mode, setMode } = useUIStore();

  return (
    <header className="flex items-center justify-between px-6 h-14 bg-bg-secondary border-b border-border-primary shrink-0">
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-info rounded-md flex items-center justify-center font-mono font-bold text-sm text-text-primary">
          C
        </div>
        <span className="font-semibold text-sm tracking-wide text-text-primary">
          Compiler Execution Visualizer
        </span>
      </div>
      <div className="flex items-center space-x-4">
        {/* Mode Selector Toggle */}
        <div 
          className="flex items-center bg-bg-tertiary border border-border-primary rounded-md p-0.5" 
          role="radiogroup" 
          aria-label="Learning Mode Selection"
        >
          <button
            onClick={() => setMode('beginner')}
            className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors focus-visible:ring-1 focus-visible:ring-info focus-visible:outline-none ${
              mode === 'beginner'
                ? 'bg-info text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            role="radio"
            aria-checked={mode === 'beginner'}
          >
            Beginner
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors focus-visible:ring-1 focus-visible:ring-info focus-visible:outline-none ${
              mode === 'advanced'
                ? 'bg-info text-text-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            role="radio"
            aria-checked={mode === 'advanced'}
          >
            Advanced
          </button>
        </div>

        <button 
          onClick={() => {
            const { sourceCode } = useEditorStore.getState();
            pipeline.compile(sourceCode);
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-info hover:bg-info/90 transition-all text-text-primary cursor-pointer focus-visible:ring-2 focus-visible:ring-info focus-visible:outline-none"
          aria-label="Compile code and run pipeline"
        >
          Compile Code
        </button>
      </div>
    </header>
  );
}
