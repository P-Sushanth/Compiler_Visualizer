import { Handle, Position } from '@xyflow/react';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import type { SourceRange } from '@/types/compiler';

const AST_GLOSSARY: Record<string, string> = {
  'Program': 'The root container node representing the entire C program.',
  'FunctionDeclaration': 'Defines a callable function with a return type, name, and parameters.',
  'BlockStatement': 'A block of statements grouped together inside curly braces { }.',
  'ReturnStatement': 'Terminates function execution and returns a value to the caller.',
  'VariableDeclaration': 'Declares a variable name, type, and optional initial value.',
  'BinaryExpression': 'An operation combining two values (e.g. addition, subtraction).',
  'IfStatement': 'A conditional check executing branches based on a boolean condition.',
  'ForStatement': 'A loop repeating execution block until a condition becomes false.',
  'ExpressionStatement': 'A statement consisting of a single evaluated expression.',
  'CallExpression': 'Invokes a function with argument values.',
  'Literal': 'A fixed constant value directly written in code.',
  'Identifier': 'A user-defined name representing a variable or function lookup.'
};

export function ASTNodeUI({ data }: { data: { type: string; label: string; value?: string | number | boolean; range?: SourceRange; id: string } }) {
  const setHighlightedLine = useEditorStore(state => state.setHighlightedLine);
  const mode = useUIStore(state => state.mode);
  const isBeginner = mode === 'beginner';
  
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
  } else if (data.type === 'declaration' || data.type === 'function' || data.type === 'Program' || data.type === 'FunctionDeclaration') {
    bgColor = 'bg-[#2A3140] border-info/50';
  } else if (data.type === 'statement' || data.type === 'BlockStatement' || data.type === 'ReturnStatement' || data.type === 'VariableDeclaration' || data.type === 'IfStatement' || data.type === 'ForStatement' || data.type === 'ExpressionStatement') {
    bgColor = 'bg-bg-tertiary border-warning/50';
  }

  const tooltipText = isBeginner
    ? (AST_GLOSSARY[data.type] || `${data.type} node`)
    : `Node type: ${data.type}`;

  return (
    <div 
      className={`p-3 rounded shadow-md border ${bgColor} font-mono max-w-[180px] flex flex-col items-center justify-center transition-transform hover:scale-105 cursor-pointer`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={tooltipText}
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
