import { useCompilerStore } from '@/store/compilerStore';
import { useEditorStore } from '@/store/editorStore';
import { StageErrorFallback } from '@/components/StageErrorFallback';

export function AssemblyViewer() {
  const assembly = useCompilerStore(state => state.assembly);
  const ast = useCompilerStore(state => state.ast);
  const setHighlightedLine = useEditorStore(state => state.setHighlightedLine);

  if (!assembly || assembly.length === 0) {
    return (
      <StageErrorFallback 
        stage="assembly" 
        title="No Assembly Output" 
        description="Compile your C code to view the generated pseudo-assembly." 
      />
    );
  }

  const handleMouseEnter = (sourceNodeId?: string | null) => {
    if (!sourceNodeId || !ast) return;
    const node = ast.nodes[sourceNodeId];
    if (node && node.range) {
      setHighlightedLine(node.range.start.line);
    }
  };

  const handleMouseLeave = () => {
    setHighlightedLine(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary font-mono text-sm">
      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary shrink-0">
        <h2 className="text-xs font-bold text-text-primary tracking-widest">X86 PSEUDO-ASSEMBLY</h2>
        <span className="ml-4 text-xs text-text-muted">{assembly.length} instructions</span>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-[#1E232D]">
        <div className="space-y-0.5">
          {assembly.map((inst, idx) => {
            // Is it a label or section?
            const isLabel = inst.op.endsWith(':') || inst.op.startsWith('.');
            
            return (
              <div 
                key={inst.id} 
                className={"flex font-mono py-1 px-2 rounded hover:bg-bg-secondary/80 transition-colors cursor-pointer group " + (isLabel ? "mt-4" : "")}
                onMouseEnter={() => handleMouseEnter(inst.sourceNodeId)}
                onMouseLeave={handleMouseLeave}
              >
                {/* Line number */}
                <div className="w-12 text-right pr-4 text-text-muted opacity-50 select-none">
                  {idx + 1}
                </div>
                
                {/* Instruction */}
                <div className="flex-1 flex space-x-2">
                  {isLabel ? (
                    <span className="text-warning font-bold">{inst.op}</span>
                  ) : (
                    <>
                      <span className="w-16 text-info font-bold">{inst.op}</span>
                      <span className="text-text-primary">{inst.args.join(', ')}</span>
                    </>
                  )}
                </div>
                
                {/* Comment */}
                <div className="w-1/3 text-text-muted italic opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis text-right pl-4">
                  {inst.comment ? '; ' + inst.comment : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
