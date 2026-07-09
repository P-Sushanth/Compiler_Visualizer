import { Handle, Position } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';

export function BasicBlockUI({ data }: { data: any }) {
  const setHighlightedLine = useEditorStore(state => state.setHighlightedLine);
  
  const handleMouseEnter = () => {
    // We would cross-reference the AST node to get the line number here
    // But for simplicity in this demo, if we don't have direct access to the AST range inside the block,
    // we just use the highlight logic if we mapped it.
    // Assuming sourceNodeId might help, but since we don't have AST ranges mapped directly in IR without store lookups:
    // We'll skip strict sync unless we add an AST lookup. 
  };
  
  const handleMouseLeave = () => {
    setHighlightedLine(null);
  };

  const isEntry = data.isEntry;
  const bgColor = isEntry ? 'bg-[#2A3140]' : 'bg-bg-tertiary';
  const borderColor = isEntry ? 'border-info' : 'border-border-primary';

  return (
    <div className={"min-w-[250px] rounded shadow-md border " + bgColor + " " + borderColor + " font-mono flex flex-col"}>
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-info opacity-50" />
      
      {/* Block Header */}
      <div className="px-3 py-1.5 bg-bg-secondary border-b border-border-primary flex justify-between items-center rounded-t">
        <span className="text-info font-bold text-xs">{data.label}</span>
        {isEntry && <span className="text-[9px] bg-info text-bg-primary px-1.5 py-0.5 rounded font-bold uppercase">ENTRY</span>}
      </div>
      
      {/* Instructions */}
      <div className="p-2 space-y-1 text-xs">
        {data.instructions && data.instructions.length > 0 ? (
          data.instructions.map((inst: any, idx: number) => (
            <div 
              key={inst.id} 
              className="flex font-mono py-0.5 px-1 hover:bg-bg-secondary hover:bg-opacity-50 rounded cursor-pointer transition-colors group"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="w-6 text-text-muted text-right pr-2 opacity-50 group-hover:opacity-100">{idx}</div>
              <div className="flex-1 flex space-x-2">
                {inst.result ? (
                  <>
                    <span className="text-warning">{inst.result}</span>
                    <span className="text-text-muted">=</span>
                    <span className="text-info font-bold">{inst.opcode}</span>
                    <span className="text-text-primary">{inst.operands.join(', ')}</span>
                  </>
                ) : (
                  <>
                    <span className="text-info font-bold">{inst.opcode}</span>
                    <span className="text-text-primary">{inst.operands.join(', ')}</span>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-text-muted italic text-[10px] text-center">No instructions</div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-info opacity-50" />
    </div>
  );
}
