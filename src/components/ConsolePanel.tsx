import { useCompilerStore } from '@/store/compilerStore';
import { useUIStore } from '@/store/uiStore';
import { useEditorStore } from '@/store/editorStore';

export function ConsolePanel() {
  const diagnostics = useCompilerStore((state) => state.diagnostics);
  const status = useCompilerStore((state) => state.status);
  const stageMetrics = useCompilerStore((state) => state.stageMetrics);
  const lastCompileDurationMs = useCompilerStore((state) => state.lastCompileDurationMs);
  
  const { activeConsoleTab, setActiveConsoleTab, setConsoleOpen } = useUIStore();
  const setHighlightedLine = useEditorStore((state) => state.setHighlightedLine);

  // Generate logs on the fly based on compile state
  const getLogs = () => {
    const logs: string[] = [];
    if (status === 'idle') {
      logs.push('Compiler visualizer idle. Write some code in main.c to compile.');
      return logs;
    }

    logs.push('Starting compiler pipeline...');
    
    const stages = ['lexer', 'parser', 'semantic', 'ir', 'optimizer', 'assembly'];
    let errorStageIndex = -1;

    // Find which stage failed (if any)
    const errorDiag = diagnostics.find(d => d.severity === 'error');
    if (errorDiag) {
      errorStageIndex = stages.indexOf(errorDiag.stage);
    }

    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      const duration = stageMetrics[stage];

      if (duration !== null) {
        logs.push(`[${stage.toUpperCase()}] Stage completed successfully in ${duration.toFixed(2)}ms`);
      } else {
        if (i === errorStageIndex) {
          logs.push(`[${stage.toUpperCase()}] Stage failed with errors!`);
          break;
        } else if (errorStageIndex !== -1 && i > errorStageIndex) {
          // A preceding stage failed, so this stage was skipped
          logs.push(`[${stage.toUpperCase()}] Stage skipped.`);
        } else if (status === 'running') {
          logs.push(`[${stage.toUpperCase()}] Stage running...`);
          break;
        }
      }
    }

    if (status === 'success') {
      logs.push(`Compilation succeeded! Total duration: ${lastCompileDurationMs?.toFixed(2) || '0.00'}ms`);
    } else if (status === 'error') {
      logs.push('Compilation failed. Please resolve the issues in the Problems tab.');
    }

    return logs;
  };

  const logs = getLogs();

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-t border-border-primary text-text-primary overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center px-4 h-9 bg-bg-secondary border-b border-border-primary shrink-0 justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setActiveConsoleTab('problems')}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center space-x-2 transition-colors cursor-pointer ${
              activeConsoleTab === 'problems' 
                ? 'bg-bg-tertiary text-text-primary' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <span>Problems</span>
            {diagnostics.length > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                diagnostics.some(d => d.severity === 'error') 
                  ? 'bg-error/20 text-error' 
                  : 'bg-warning/20 text-warning'
              }`}>
                {diagnostics.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveConsoleTab('output')}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeConsoleTab === 'output' 
                ? 'bg-bg-tertiary text-text-primary' 
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Compiler Output
          </button>
        </div>
        <button 
          onClick={() => setConsoleOpen(false)}
          className="text-text-muted hover:text-text-primary text-xs p-1 cursor-pointer transition-colors"
          title="Close Panel"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-auto bg-bg-primary p-2">
        {activeConsoleTab === 'problems' ? (
          diagnostics.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-muted text-xs space-y-2">
              <svg className="w-8 h-8 text-success opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>No problems have been detected in the workspace.</span>
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-primary text-text-muted text-[10px]">
                  <th className="py-1 px-2 w-20">STAGE</th>
                  <th className="py-1 px-2 w-20">SEVERITY</th>
                  <th className="py-1 px-2 w-20">LOCATION</th>
                  <th className="py-1 px-2">MESSAGE</th>
                </tr>
              </thead>
              <tbody>
                {diagnostics.map((err) => (
                  <tr 
                    key={err.id}
                    onClick={() => {
                      if (err.range) {
                        setHighlightedLine(err.range.start.line);
                      }
                    }}
                    className="border-b border-border-primary hover:bg-bg-secondary transition-colors cursor-pointer group"
                  >
                    <td className="py-1.5 px-2">
                      <span className="text-[10px] bg-bg-tertiary px-1.5 py-0.5 rounded text-text-secondary">
                        {err.stage.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-1.5 px-2">
                      <span className={`font-bold ${
                        err.severity === 'error' ? 'text-error' : 'text-warning'
                      }`}>
                        {err.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-text-muted group-hover:text-text-secondary transition-colors">
                      {err.range ? `${err.range.start.line}:${err.range.start.column}` : 'N/A'}
                    </td>
                    <td className="py-1.5 px-2 text-text-primary font-sans leading-normal">
                      {err.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        ) : (
          <div className="font-mono text-xs text-text-secondary leading-loose p-2">
            {logs.map((log, idx) => (
              <div key={idx} className={
                log.startsWith('Compilation succeeded') 
                  ? 'text-success font-bold' 
                  : log.startsWith('Compilation failed') || log.includes('failed')
                    ? 'text-error font-bold'
                    : 'text-text-secondary'
              }>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
