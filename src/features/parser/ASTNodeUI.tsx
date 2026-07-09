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
  let bgColor = 'bg-bg-secondary border-border-primary';
  if (data.nodeType === 'Program' || data.nodeType === 'FunctionDeclaration') {
    bgColor = 'bg-[#394355] border-[#6E7681]';
  } else if (data.nodeType?.includes('Statement')) {
    bgColor = 'bg-[#2A3140] border-info border-opacity-50';
  } else if (data.nodeType?.includes('Expression') || data.nodeType?.includes('Literal') || data.nodeType?.includes('Identifier')) {
    bgColor = 'bg-bg-tertiary border-warning border-opacity-50';
  }

  return (
    <div 
      className={`min-w-[150px] p-2 rounded shadow-md border ${bgColor} text-xs font-mono flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-info" />
      
      <div className="font-bold text-text-primary uppercase tracking-wide truncate max-w-full pb-1">
        {data.label}
      </div>
      
      {data.details && (
        <div className="text-text-muted truncate max-w-full text-[10px] bg-bg-primary bg-opacity-40 px-2 py-0.5 rounded">
          {data.details}
        </div>
      )}
      
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-info" />
    </div>
  );
}
