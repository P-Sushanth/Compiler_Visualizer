import { create } from 'zustand';
import type { Token, AST, CompilerDiagnostic } from '@/types/compiler';

export type PipelineStatus = 'idle' | 'running' | 'success' | 'error';

type CompilerState = {
  // Status
  status: PipelineStatus;
  setStatus: (status: PipelineStatus) => void;
  
  // Outputs
  tokens: Token[] | null;
  setTokens: (tokens: Token[]) => void;
  
  ast: AST | null;
  setAST: (ast: AST) => void;
  
  semanticModel: import('@/types/compiler').SemanticModel | null;
  setSemanticModel: (model: import('@/types/compiler').SemanticModel) => void;

  ir: import('@/types/compiler').IRProgram | null;
  setIR: (ir: import('@/types/compiler').IRProgram) => void;

  optimizedIR: import('@/types/compiler').IRProgram | null;
  setOptimizedIR: (ir: import('@/types/compiler').IRProgram) => void;

  optimizationPasses: import('@/types/pipeline').OptimizationPass[];
  setOptimizationPasses: (passes: import('@/types/pipeline').OptimizationPass[]) => void;
  
  assembly: import('@/types/pipeline').AssemblyInstruction[];
  setAssembly: (assembly: import('@/types/pipeline').AssemblyInstruction[]) => void;

  // Diagnostics
  diagnostics: CompilerDiagnostic[];
  setDiagnostics: (diagnostics: CompilerDiagnostic[]) => void;
  
  // Timing
  lastCompileDurationMs: number | null;
  setLastCompileDurationMs: (ms: number) => void;

  stageMetrics: Record<string, number | null>;
  setStageMetric: (stage: string, ms: number) => void;
};

export const useCompilerStore = create<CompilerState>((set) => ({
  status: 'idle',
  setStatus: (status) => set({ status }),
  
  tokens: null,
  setTokens: (tokens) => set({ tokens }),
  
  ast: null,
  setAST: (ast) => set({ ast }),
  
  semanticModel: null,
  setSemanticModel: (semanticModel) => set({ semanticModel }),

  ir: null,
  setIR: (ir) => set({ ir }),

  optimizedIR: null,
  setOptimizedIR: (optimizedIR) => set({ optimizedIR }),

  optimizationPasses: [],
  setOptimizationPasses: (optimizationPasses) => set({ optimizationPasses }),
  
  assembly: [],
  setAssembly: (assembly) => set({ assembly }),

  diagnostics: [],
  setDiagnostics: (diagnostics) => set({ diagnostics }),
  
  lastCompileDurationMs: null,
  setLastCompileDurationMs: (ms) => set({ lastCompileDurationMs: ms }),

  stageMetrics: {
    lexer: null,
    parser: null,
    semantic: null,
    ir: null,
    optimizer: null,
    assembly: null,
  },
  setStageMetric: (stage, ms) => set((state) => ({
    stageMetrics: { ...state.stageMetrics, [stage]: ms }
  })),
}));
