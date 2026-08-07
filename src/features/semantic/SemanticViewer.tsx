import { useState } from 'react';
import { useCompilerStore } from '@/store/compilerStore';
import { useEditorStore } from '@/store/editorStore';
import { StageErrorFallback } from '@/components/StageErrorFallback';

export function SemanticViewer() {
  const semanticModel = useCompilerStore((state) => state.semanticModel);
  const ast = useCompilerStore((state) => state.ast);
  const setHighlightedLine = useEditorStore((state) => state.setHighlightedLine);
  
  const [activeTab, setActiveTab] = useState<'symbols' | 'scopes'>('symbols');

  if (!semanticModel || Object.keys(semanticModel.scopes).length === 0) {
    return (
      <StageErrorFallback 
        stage="semantic" 
        title="Semantic Model Pending" 
        description="Compile your C code to see symbol tables and scope hierarchy." 
      />
    );
  }

  const { symbols, scopes } = semanticModel;

  const handleMouseEnter = (nodeId: string) => {
    if (!ast || !ast.nodes[nodeId]) return;
    const node = ast.nodes[nodeId];
    if (node.range) {
      setHighlightedLine(node.range.start.line);
    }
  };

  const handleMouseLeave = () => {
    setHighlightedLine(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary font-mono text-sm">
      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary shrink-0 space-x-2">
        <button 
          onClick={() => setActiveTab('symbols')}
          className={"px-3 py-1 text-xs font-semibold rounded " + (activeTab === 'symbols' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary')}
        >
          Symbol Table
        </button>
        <button 
          onClick={() => setActiveTab('scopes')}
          className={"px-3 py-1 text-xs font-semibold rounded " + (activeTab === 'scopes' ? 'bg-bg-tertiary text-text-primary' : 'text-text-muted hover:text-text-primary')}
        >
          Scope Hierarchy
        </button>
      </div>
      
      <div className="flex-1 overflow-auto bg-bg-primary p-4 space-y-4">
        {activeTab === 'symbols' && (
          <div className="w-full">
            <div className="flex items-center px-2 h-8 bg-bg-secondary text-xs text-text-secondary font-bold tracking-wider mb-2 rounded border border-border-primary">
              <div className="w-1/4">NAME</div>
              <div className="w-1/4">TYPE</div>
              <div className="w-1/4">SCOPE ID</div>
              <div className="w-1/4 text-right">REFERENCES</div>
            </div>
            
            <div className="space-y-1">
              {Object.values(symbols).map(sym => (
                <div 
                  key={sym.id} 
                  className="flex items-center px-2 py-2 bg-bg-tertiary border border-border-primary border-opacity-30 rounded hover:bg-bg-secondary transition-colors cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(sym.declarationNodeId)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="w-1/4 font-semibold text-info truncate">{sym.name}</div>
                  <div className="w-1/4 text-xs text-warning uppercase truncate">{sym.symbolType}</div>
                  <div className="w-1/4 text-xs text-text-muted truncate" title={sym.scopeId}>{sym.scopeId.slice(0, 8)}</div>
                  <div className="w-1/4 text-right text-xs text-text-muted truncate">
                    Node: {sym.declarationNodeId.slice(0, 6)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scopes' && (
          <div className="w-full">
            <div className="space-y-4">
              {Object.values(scopes).map(scope => (
                <div key={scope.id} className="bg-bg-tertiary border border-border-primary rounded p-3">
                  <div className="flex justify-between items-center mb-3 pb-2 border-b border-border-primary border-opacity-50">
                    <div className="text-sm font-semibold text-text-primary">Scope {scope.id.slice(0, 8)}</div>
                    {scope.parentScopeId ? (
                      <div className="text-xs text-text-muted">Parent: {scope.parentScopeId.slice(0, 8)}</div>
                    ) : (
                      <div className="text-xs text-[#238636] font-bold px-2 py-0.5 rounded bg-[#238636] bg-opacity-10 border border-[#238636] border-opacity-20">GLOBAL</div>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {scope.symbolIds.length > 0 ? (
                      scope.symbolIds.map(symId => (
                        <div 
                          key={symId} 
                          className="px-2 py-1 text-xs rounded bg-bg-secondary border border-border-primary flex items-center space-x-2 cursor-pointer hover:border-info transition-colors"
                          onMouseEnter={() => handleMouseEnter(symbols[symId].declarationNodeId)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <span className="text-info">{symbols[symId].name}</span>
                          <span className="text-text-muted opacity-50">|</span>
                          <span className="text-warning text-[10px] uppercase">{symbols[symId].symbolType}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-text-muted italic">No symbols in this scope</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
