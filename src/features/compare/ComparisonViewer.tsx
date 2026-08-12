import { useState } from 'react';
import { useCompilerStore } from '@/store/compilerStore';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { StageErrorFallback } from '@/components/StageErrorFallback';

type ComparisonTab = 'source-ast' | 'ast-ir' | 'ir-assembly';

export function ComparisonViewer() {
  const [activeTab, setActiveTab] = useState<ComparisonTab>('source-ast');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const sourceCode = useEditorStore((state) => state.sourceCode);
  const ast = useCompilerStore((state) => state.ast);
  const ir = useCompilerStore((state) => state.ir);
  const assembly = useCompilerStore((state) => state.assembly);
  const mode = useUIStore((state) => state.mode);

  const isBeginner = mode === 'beginner';

  if (!ast || !ir || !assembly || assembly.length === 0) {
    return (
      <StageErrorFallback
        stage="compare"
        title="Comparison Data Pending"
        description="Compile your C code successfully to enable comparison views."
      />
    );
  }

  // Pre-process C lines
  const sourceLines = sourceCode.split('\n');

  // Pre-process IR instructions into a linear array
  const irInstructions = Object.values(ir.blocks).flatMap((block) =>
    block.instructionIds.map((id) => ir.instructions[id]).filter(Boolean)
  );

  // Helper to find AST node by line number
  const getASTNodesForLine = (line: number) => {
    return Object.values(ast.nodes).filter(
      (node) => node.range && node.range.start.line <= line && node.range.end.line >= line
    );
  };

  // Helper to get printable label for an AST node
  const getNodeLabel = (node: import('@/types/compiler').ASTNode) => {
    if ('name' in node) return node.name;
    if ('identifier' in node) return node.identifier;
    if ('operator' in node) return node.operator;
    if ('value' in node && node.value !== null) return String(node.value);
    return node.type;
  };

  // Explanation notes based on active comparisons and hover states
  const getExplanation = () => {
    if (activeTab === 'source-ast') {
      if (hoveredLine !== null) {
        const nodes = getASTNodesForLine(hoveredLine);
        if (nodes.length > 0) {
          const types = nodes.map((n) => n.type).join(', ');
          return `Line ${hoveredLine} parses into AST nodes of type: [ ${types} ]. The parser evaluates C grammar rules to build this tree hierarchy.`;
        }
      }
      if (hoveredNodeId && ast.nodes[hoveredNodeId]) {
        const node = ast.nodes[hoveredNodeId];
        return `AST Node "${node.type}" (${getNodeLabel(node)}) maps back to lines ${node.range.start.line} to ${node.range.end.line} in your source code.`;
      }
      return 'Hover over source code lines or AST nodes to see how characters are parsed into logical tree nodes.';
    }

    if (activeTab === 'ast-ir') {
      if (hoveredNodeId && ast.nodes[hoveredNodeId]) {
        const node = ast.nodes[hoveredNodeId];
        const matchingIR = irInstructions.filter((inst) => inst.sourceNodeId === hoveredNodeId);
        if (matchingIR.length > 0) {
          return `AST Node "${node.type}" generates ${matchingIR.length} intermediate instructions (e.g. ${matchingIR[0].opcode}). IR simplifies trees into linear operations.`;
        }
        return `AST Node "${node.type}" is a structural node that does not emit direct IR instructions.`;
      }
      return 'Hover over AST nodes or IR instructions to see how the syntax tree is flattened into linear assembly-like instructions.';
    }

    if (activeTab === 'ir-assembly') {
      if (hoveredNodeId) {
        const matchingIR = irInstructions.filter((inst) => inst.sourceNodeId === hoveredNodeId);
        const matchingASM = assembly.filter((inst) => inst.sourceNodeId === hoveredNodeId);
        if (matchingIR.length > 0 || matchingASM.length > 0) {
          return `The source AST node generated ${matchingIR.length} IR instructions and ${matchingASM.length} Assembly instructions. Code Generation maps abstract operations to CPU machine registers.`;
        }
      }
      return 'Hover over IR or Assembly instructions to see how abstract compiler operations map to physical x86 machine instructions.';
    }

    return '';
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary font-mono text-sm text-text-primary">
      {/* Tab controls */}
      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary shrink-0 space-x-2 justify-between">
        <div className="flex items-center space-x-2 animate-fade">
          <button
            onClick={() => {
              setActiveTab('source-ast');
              setHoveredNodeId(null);
              setHoveredLine(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'source-ast'
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Source vs AST
          </button>
          <button
            onClick={() => {
              setActiveTab('ast-ir');
              setHoveredNodeId(null);
              setHoveredLine(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'ast-ir'
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            AST vs IR
          </button>
          <button
            onClick={() => {
              setActiveTab('ir-assembly');
              setHoveredNodeId(null);
              setHoveredLine(null);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
              activeTab === 'ir-assembly'
                ? 'bg-bg-tertiary text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            IR vs Assembly
          </button>
        </div>
        <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
          Transformation Diff Viewer
        </span>
      </div>

      {/* Main Split Panels */}
      <div className="flex-1 flex min-h-0 border-b border-border-primary overflow-hidden">
        {/* LEFT PANEL */}
        <div className="flex-1 flex flex-col border-r border-border-primary min-w-0">
          <div className="bg-bg-secondary px-3 py-1.5 text-xs font-bold text-text-muted border-b border-border-primary uppercase shrink-0">
            {activeTab === 'source-ast' && 'Source Code (main.c)'}
            {activeTab === 'ast-ir' && 'Abstract Syntax Tree (AST Nodes)'}
            {activeTab === 'ir-assembly' && 'Intermediate Representation (IR)'}
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-1 bg-bg-primary">
            {activeTab === 'source-ast' && (
              <div className="space-y-0.5">
                {sourceLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isLineHovered = hoveredLine === lineNum;
                  const matchingNodes = getASTNodesForLine(lineNum);
                  const isNodeMapped = hoveredNodeId && matchingNodes.some((n) => n.id === hoveredNodeId);
                  const highlightClass = isLineHovered || isNodeMapped
                    ? 'bg-info/20 border-l-2 border-info text-text-primary font-bold'
                    : 'hover:bg-bg-secondary/40 text-text-secondary';

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => {
                        setHoveredLine(lineNum);
                        if (matchingNodes.length > 0) {
                          setHoveredNodeId(matchingNodes[matchingNodes.length - 1].id);
                        }
                      }}
                      onMouseLeave={() => {
                        setHoveredLine(null);
                        setHoveredNodeId(null);
                      }}
                      className={`flex px-2 py-0.5 rounded cursor-pointer transition-colors ${highlightClass}`}
                    >
                      <div className="w-8 text-text-muted text-right pr-3 select-none">{lineNum}</div>
                      <pre className="flex-1 whitespace-pre">{line || ' '}</pre>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'ast-ir' && (
              <div className="space-y-1">
                {Object.values(ast.nodes).map((node) => {
                  const isNodeHovered = hoveredNodeId === node.id;
                  const highlightClass = isNodeHovered
                    ? 'bg-info/20 border border-info text-text-primary font-bold shadow-sm'
                    : 'bg-bg-tertiary border border-border-primary/40 hover:bg-bg-secondary text-text-secondary';

                  return (
                    <div
                      key={node.id}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`p-2 rounded cursor-pointer transition-colors ${highlightClass}`}
                    >
                      <div className="text-[10px] uppercase font-bold text-text-muted mb-0.5">{node.type}</div>
                      <div className="font-semibold text-xs text-text-primary">{getNodeLabel(node)}</div>
                      {node.range && (
                        <div className="text-[9px] text-text-muted mt-1">
                          Line {node.range.start.line}:{node.range.start.column} - {node.range.end.line}:{node.range.end.column}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'ir-assembly' && (
              <div className="space-y-1">
                {irInstructions.map((inst) => {
                  const isInstHovered = hoveredNodeId && inst.sourceNodeId === hoveredNodeId;
                  const highlightClass = isInstHovered
                    ? 'bg-info/20 border-l-2 border-info text-text-primary font-bold'
                    : 'bg-bg-tertiary/40 border border-border-primary/20 hover:bg-bg-secondary/40 text-text-secondary';

                  return (
                    <div
                      key={inst.id}
                      onMouseEnter={() => setHoveredNodeId(inst.sourceNodeId)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`p-2 rounded cursor-pointer transition-all ${highlightClass}`}
                    >
                      <div className="flex space-x-2 text-xs">
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
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-bg-secondary px-3 py-1.5 text-xs font-bold text-text-muted border-b border-border-primary uppercase shrink-0">
            {activeTab === 'source-ast' && 'Abstract Syntax Tree (AST)'}
            {activeTab === 'ast-ir' && 'Intermediate Representation (IR)'}
            {activeTab === 'ir-assembly' && 'Pseudo-Assembly (X86)'}
          </div>

          <div className="flex-1 overflow-auto p-3 space-y-1 bg-[#1E232D]">
            {activeTab === 'source-ast' && (
              <div className="space-y-1">
                {Object.values(ast.nodes).map((node) => {
                  const isNodeHovered = hoveredNodeId === node.id;
                  const matchingNodes = hoveredLine !== null ? getASTNodesForLine(hoveredLine) : [];
                  const isLineRelated = matchingNodes.some((n) => n.id === node.id);

                  const highlightClass = isNodeHovered || isLineRelated
                    ? 'bg-info/20 border border-info text-text-primary font-bold shadow-sm'
                    : 'bg-bg-tertiary border border-border-primary/40 hover:bg-bg-secondary text-text-secondary';

                  return (
                    <div
                      key={node.id}
                      onMouseEnter={() => {
                        setHoveredNodeId(node.id);
                        if (node.range) setHoveredLine(node.range.start.line);
                      }}
                      onMouseLeave={() => {
                        setHoveredNodeId(null);
                        setHoveredLine(null);
                      }}
                      className={`p-2 rounded cursor-pointer transition-colors ${highlightClass}`}
                    >
                      <div className="text-[10px] uppercase font-bold text-text-muted mb-0.5">{node.type}</div>
                      <div className="font-semibold text-xs text-text-primary">{getNodeLabel(node)}</div>
                      {node.range && (
                        <div className="text-[9px] text-text-muted mt-1">
                          Line {node.range.start.line}:{node.range.start.column} - {node.range.end.line}:{node.range.end.column}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'ast-ir' && (
              <div className="space-y-1">
                {irInstructions.map((inst) => {
                  const isInstHovered = hoveredNodeId && inst.sourceNodeId === hoveredNodeId;
                  const highlightClass = isInstHovered
                    ? 'bg-info/20 border-l-2 border-info text-text-primary font-bold'
                    : 'bg-bg-tertiary/40 border border-border-primary/20 hover:bg-bg-secondary/40 text-text-secondary';

                  return (
                    <div
                      key={inst.id}
                      onMouseEnter={() => setHoveredNodeId(inst.sourceNodeId)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`p-2 rounded cursor-pointer transition-all ${highlightClass}`}
                    >
                      <div className="flex space-x-2 text-xs">
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
                  );
                })}
              </div>
            )}

            {activeTab === 'ir-assembly' && (
              <div className="space-y-0.5">
                {assembly.map((inst, idx) => {
                  const isLabel = inst.op.endsWith(':') || inst.op.startsWith('.');
                  const isAsmHovered = hoveredNodeId && inst.sourceNodeId === hoveredNodeId;
                  const highlightClass = isAsmHovered
                    ? 'bg-info/20 border-l-2 border-info text-text-primary font-bold'
                    : 'hover:bg-bg-secondary/40 text-text-secondary';

                  return (
                    <div
                      key={inst.id}
                      onMouseEnter={() => setHoveredNodeId(inst.sourceNodeId ?? null)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      className={`flex font-mono py-0.5 px-2 rounded cursor-pointer transition-colors ${highlightClass} ${
                        isLabel ? 'mt-4' : ''
                      }`}
                    >
                      <div className="w-8 text-right pr-3 text-text-muted opacity-50 select-none">
                        {idx + 1}
                      </div>
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
                      {inst.comment && (
                        <div className="text-text-muted italic opacity-50 whitespace-nowrap overflow-hidden text-ellipsis pl-4">
                          ; {inst.comment}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Explanation Banner (Beginner Mode Only) */}
      {isBeginner && (
        <div className="p-4 bg-bg-tertiary text-xs leading-relaxed text-text-secondary border-t border-border-primary shrink-0 z-10">
          <h3 className="font-bold text-info mb-1 uppercase tracking-wider text-[10px]">
            {activeTab === 'source-ast' && 'Flow 1: Syntactic Parser Transformation'}
            {activeTab === 'ast-ir' && 'Flow 2: Intermediate Code Flattening'}
            {activeTab === 'ir-assembly' && 'Flow 3: Low-Level Register Code Generation'}
          </h3>
          <p className="italic text-text-primary">{getExplanation()}</p>
        </div>
      )}
    </div>
  );
}
