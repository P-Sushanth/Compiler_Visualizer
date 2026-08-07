import { Handle, Position } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import type { SourceRange } from '@/types/compiler';

export function ASTNodeUI({ data }: { data: any }) {
  const setHighlightedLine = useEditorStore(state => state.setHighlightedLine);
  
  const handleMouseEnter = () => {
    if (data.range) {
      setHighlightedLine((data.range as SourceRange).start.line);
    }
  };
  
  const handleMouseLeave = () => {
    setHighlightedLine(null);
  };

  // Assign distinct colors to node types
  let bgColor = 'bg-bg-tertiary border-border-primary';
  if (data.type === 'error') {
    bgColor = 'bg-[#2A1D1D] border-error';
  } else if (data.type === 'declaration' || data.type === 'function') {
    bgColor = 'bg-[#2A3140] border-info/50';
  } else if (data.type === 'statement') {
    bgColor = 'bg-bg-tertiary border-warning/50';
  }

  return (
    <div 
      className={`p-3 rounded shadow-md border ${bgColor} font-mono max-w-[180px] flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle type="target" position={Position.Top} className="w-1.5 h-1.5 !bg-info opacity-40" />
      
      <div className="text-[10px] uppercase font-bold text-text-muted mb-0.5 tracking-wider truncate max-w-full">
        {data.type}
      </div>
      
      <div className="text-xs font-semibold text-text-primary text-center break-all max-w-full">
        {data.label}
      </div>
      
      {data.value !== undefined && (
        <div className="text-text-muted truncate max-w-full text-[10px] bg-bg-primary/40 px-2 py-0.5 rounded">
          {data.value}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-info" />
    </div>
  );
}
