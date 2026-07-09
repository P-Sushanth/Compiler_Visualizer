import { useState } from 'react';
import { useCompilerStore } from '@/store/compilerStore';
import { EmptyState } from '@/components/EmptyState';

export function OptimizerViewer() {
  const ir = useCompilerStore(state => state.ir);
  const optimizedIR = useCompilerStore(state => state.optimizedIR);
  const passes = useCompilerStore(state => state.optimizationPasses);
  
  const [activeTab, setActiveTab] = useState<'passes' | 'diff'>('passes');

  if (!ir || !optimizedIR) {
    return <EmptyState title="No Optimization Passes" description="Compile your code to view applied optimizations and before/after diffs." />;
  }

  // Formatting IR for Diff View
  const formatIR = (irProgram: any) => {
    let output = '';
    if (!irProgram.blocks) return output;
    Object.values(irProgram.blocks).forEach((block: any) => {
      output += `${block.label}:\n`;
      block.instructionIds.forEach((id: string) => {
        const inst = irProgram.instructions[id];
        if (!inst) return;
        const result = inst.result ? `${inst.result} = ` : '';
        output += `  ${result}${inst.opcode} ${inst.operands.join(', ')}\n`;
      });
      output += '\n';
    });
    return output.trim();
  };

  const rawIRText = formatIR(ir);
  const optIRText = formatIR(optimizedIR);

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary font-mono text-sm">
      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary shrink-0 space-x-2">
        <button 
          onClick={() => setActiveTab('passes')}
          className={"px-3 py-1 text-xs font-semibold rounded " + (activeTab === 'passes' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary')}
        >
          Optimization Passes
        </button>
        <button 
          onClick={() => setActiveTab('diff')}
          className={"px-3 py-1 text-xs font-semibold rounded " + (activeTab === 'diff' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary')}
        >
          Before / After Diff
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-bg-primary p-4">
        {activeTab === 'passes' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            {passes.length > 0 ? (
              passes.map((pass, index) => (
                <div key={pass.id} className="bg-bg-tertiary border border-border-primary rounded p-4 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-info"></div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-text-primary flex items-center space-x-2">
                      <span className="bg-bg-secondary text-text-muted px-2 py-0.5 rounded text-xs">#{index + 1}</span>
                      <span>{pass.name}</span>
                    </h3>
                    <div className="flex space-x-2 text-xs">
                      {pass.instructionsModified > 0 && (
                        <span className="text-warning bg-warning bg-opacity-10 px-2 py-1 rounded">
                          {pass.instructionsModified} modified
                        </span>
                      )}
                      {pass.instructionsRemoved > 0 && (
                        <span className="text-error bg-error bg-opacity-10 px-2 py-1 rounded">
                          {pass.instructionsRemoved} removed
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-text-muted text-xs">{pass.description}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border-primary rounded text-text-muted">
                <p>No optimization passes were applicable to this code.</p>
                <p className="text-xs mt-2">Try writing code with dead variables or constant expressions like <code>int x = 5 + 5;</code></p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="flex h-full space-x-4">
            <div className="flex-1 flex flex-col border border-border-primary rounded overflow-hidden">
              <div className="bg-bg-secondary px-3 py-1.5 text-xs font-bold text-text-muted border-b border-border-primary">
                Unoptimized IR
              </div>
              <pre className="flex-1 p-4 overflow-auto text-xs text-text-secondary leading-relaxed bg-bg-primary">
                {rawIRText}
              </pre>
            </div>
            
            <div className="flex-1 flex flex-col border border-border-primary rounded overflow-hidden">
              <div className="bg-bg-secondary px-3 py-1.5 text-xs font-bold text-info border-b border-border-primary flex justify-between">
                <span>Optimized IR</span>
                {passes.length > 0 && <span className="text-warning">{passes.length} passes applied</span>}
              </div>
              <pre className="flex-1 p-4 overflow-auto text-xs text-text-primary leading-relaxed bg-[#1E232D]">
                {optIRText}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
