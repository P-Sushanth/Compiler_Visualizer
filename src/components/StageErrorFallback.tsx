import { useCompilerStore } from '@/store/compilerStore';
import { useEditorStore } from '@/store/editorStore';
import type { CompilerStage } from '@/types/compiler';

interface StageErrorFallbackProps {
  stage: CompilerStage;
  title: string;
  description: string;
}

export function StageErrorFallback({ stage, title, description }: StageErrorFallbackProps) {
  const diagnostics = useCompilerStore((state) => state.diagnostics);
  const status = useCompilerStore((state) => state.status);
  const setHighlightedLine = useEditorStore((state) => state.setHighlightedLine);

  // Filter diagnostics relevant to this stage
  const stageErrors = diagnostics.filter(err => err.stage === stage && err.severity === 'error');
  
  // Find which stage actually failed
  const failedStage = diagnostics.find(err => err.severity === 'error')?.stage || 'unknown';

  if (status !== 'error') {
    return (
      <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-bg-primary text-center">
        <div className="bg-bg-tertiary border border-border-primary rounded-xl p-8 flex flex-col items-center max-w-md w-full shadow-lg">
          <h3 className="text-text-primary font-bold tracking-wide mb-2">{title}</h3>
          <p className="text-text-muted text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary p-6 overflow-auto">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        <div className="bg-error/10 border border-error/35 rounded-xl p-6 shadow-lg border-t-4 border-t-error">
          <div className="flex items-center space-x-3 text-error mb-2">
            <svg className="w-6 h-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold tracking-wide">
              {failedStage === stage 
                ? `${stage.toUpperCase()} Stage Failed` 
                : `Preceding Stage Failed: ${failedStage.toUpperCase()}`}
            </h3>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            {failedStage === stage 
              ? `The ${stage} stage encountered critical compiler errors. Fix them in the editor to run this stage.`
              : `This stage could not run because the compiler pipeline failed at the ${failedStage} stage.`}
          </p>
        </div>

        {failedStage === stage && stageErrors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-text-muted font-bold font-mono">Errors Found ({stageErrors.length})</h4>
            <div className="space-y-2">
              {stageErrors.map((err) => (
                <div 
                  key={err.id}
                  onClick={() => {
                    if (err.range) {
                      setHighlightedLine(err.range.start.line);
                    }
                  }}
                  className="bg-bg-tertiary hover:bg-bg-secondary border border-border-primary hover:border-error/40 transition-all rounded-lg p-4 cursor-pointer flex flex-col space-y-2 group shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="px-2 py-0.5 rounded font-bold uppercase bg-error/15 text-error border border-error/35 text-[9px]">
                      {err.severity}
                    </span>
                    {err.range && (
                      <span className="text-text-muted group-hover:text-text-secondary transition-colors">
                        Line {err.range.start.line}, Col {err.range.start.column}
                      </span>
                    )}
                  </div>
                  <p className="text-text-primary text-sm font-mono leading-relaxed">{err.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
