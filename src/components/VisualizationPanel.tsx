import React, { Suspense } from 'react';

const TokenTable = React.lazy(() => import('@/features/lexer/TokenTable').then(m => ({ default: m.TokenTable })));
const ASTGraph = React.lazy(() => import('@/features/parser/ASTGraph').then(m => ({ default: m.ASTGraph })));
const SemanticViewer = React.lazy(() => import('@/features/semantic/SemanticViewer').then(m => ({ default: m.SemanticViewer })));
const IRViewer = React.lazy(() => import('@/features/ir/IRViewer').then(m => ({ default: m.IRViewer })));
const OptimizerViewer = React.lazy(() => import('@/features/optimizer/OptimizerViewer').then(m => ({ default: m.OptimizerViewer })));
const AssemblyViewer = React.lazy(() => import('@/features/assembly/AssemblyViewer').then(m => ({ default: m.AssemblyViewer })));

import { useUIStore } from '@/store/uiStore';

export function VisualizationPanel() {
  const activeStage = useUIStore((state) => state.activeStage);

  return (
    <section className="flex flex-col h-full bg-bg-primary w-full shadow-[-4px_0_15px_rgba(0,0,0,0.5)] z-20">
      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary justify-between shrink-0">
        <span className="text-xs font-semibold tracking-wide uppercase text-text-secondary">
          Visualization Panel
        </span>
        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-info bg-opacity-15 text-info border border-info border-opacity-35">
          {String(activeStage).toUpperCase()} STAGE
        </span>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <Suspense fallback={
          <div className="flex h-full w-full items-center justify-center">
            <div className="w-8 h-8 border-4 border-t-info border-r-transparent border-b-info border-l-transparent rounded-full animate-spin"></div>
          </div>
        }>
          {activeStage === 'lexer' ? (
            <TokenTable />
          ) : activeStage === 'parser' ? (
            <ASTGraph />
          ) : activeStage === 'semantic' ? (
            <SemanticViewer />
          ) : activeStage === 'ir' ? (
            <IRViewer />
          ) : activeStage === 'optimizer' ? (
            <OptimizerViewer />
          ) : activeStage === 'assembly' ? (
            <AssemblyViewer />
          ) : (
            <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-bg-primary text-center">
              <div className="bg-bg-tertiary border border-border-primary rounded-xl p-8 flex flex-col items-center max-w-md w-full shadow-lg">
                <div className="mb-4 w-12 h-12 bg-bg-secondary border border-border-primary rounded-lg flex items-center justify-center shadow-inner">
                  <div className="w-6 h-6 border-2 border-dashed border-text-muted rounded"></div>
                </div>
                <h3 className="text-text-primary font-bold tracking-wide mb-2">
                  Active Visualization: {String(activeStage).toUpperCase()}
                </h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  Compile your C code to see the stage-specific outputs (Tokens, AST Graph, Scope Hierarchy, LLVM IR, or Assembly Instructions).
                </p>
              </div>
            </div>
          )}
        </Suspense>
      </div>
    </section>
  );
}
