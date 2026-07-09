import { useEditorStore } from '@/store/editorStore';
import { pipeline } from '@/services/PipelineOrchestrator';

export function TopBar() {
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
        <button 
          onClick={() => {
            const { sourceCode } = useEditorStore.getState();
            pipeline.compile(sourceCode);
          }}
          className="px-3 py-1.5 text-xs font-medium rounded-md bg-info hover:bg-opacity-90 transition-all text-text-primary cursor-pointer focus-visible:ring-2 focus-visible:ring-info focus-visible:outline-none"
          aria-label="Compile code and run pipeline"
        >
          Compile Code
        </button>
      </div>
    </header>
  );
}
