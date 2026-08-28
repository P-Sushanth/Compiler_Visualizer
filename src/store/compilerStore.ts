import { create } from 'zustand'
import type { Token, AST, CompilerDiagnostic } from '@/types/compiler'

export type PipelineStatus = 'idle' | 'running' | 'success' | 'error'

type CompilerState = {
  // Status
  status: PipelineStatus
  setStatus: (status: PipelineStatus) => void

  // Outputs
  tokens: Token[] | null
  setTokens: (tokens: Token[]) => void

  ast: AST | null
  setAST: (ast: AST) => void

  semanticModel: import('@/types/compiler').SemanticModel | null
  setSemanticModel: (model: import('@/types/compiler').SemanticModel) => void

  ir: import('@/types/compiler').IRProgram | null
  setIR: (ir: import('@/types/compiler').IRProgram) => void

  optimizedIR: import('@/types/compiler').IRProgram | null
  setOptimizedIR: (ir: import('@/types/compiler').IRProgram) => void

  optimizationPasses: import('@/types/pipeline').OptimizationPass[]
  setOptimizationPasses: (
    passes: import('@/types/pipeline').OptimizationPass[],
  ) => void

  assembly: import('@/types/pipeline').AssemblyInstruction[]
  setAssembly: (
    assembly: import('@/types/pipeline').AssemblyInstruction[],
  ) => void

  // Diagnostics
  diagnostics: CompilerDiagnostic[]
  setDiagnostics: (diagnostics: CompilerDiagnostic[]) => void

  // Timing
  lastCompileDurationMs: number | null
  setLastCompileDurationMs: (ms: number) => void

  stageMetrics: Record<string, number | null>
  setStageMetric: (stage: string, ms: number) => void

  // Batched Actions
  setCompileStart: () => void
  setCompileSuccess: (payload: {
    tokens: Token[]
    ast: AST
    semanticModel: import('@/types/compiler').SemanticModel
    ir: import('@/types/compiler').IRProgram
    optimizedIR: import('@/types/compiler').IRProgram
    optimizationPasses: import('@/types/pipeline').OptimizationPass[]
    assembly: import('@/types/pipeline').AssemblyInstruction[]
    stageMetrics: Record<string, number | null>
    lastCompileDurationMs: number
  }) => void
  setCompileError: (
    errors: CompilerDiagnostic[],
    intermediateOutputs?: Partial<
      Pick<
        CompilerState,
        | 'tokens'
        | 'ast'
        | 'semanticModel'
        | 'ir'
        | 'optimizedIR'
        | 'assembly'
        | 'stageMetrics'
      >
    >,
  ) => void
}

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
  setStageMetric: (stage, ms) =>
    set((state) => ({
      stageMetrics: { ...state.stageMetrics, [stage]: ms },
    })),

  setCompileStart: () =>
    set({
      status: 'running',
      diagnostics: [],
      tokens: null,
      ast: null,
      semanticModel: null,
      ir: null,
      optimizedIR: null,
      optimizationPasses: [],
      assembly: [],
    }),

  setCompileSuccess: (payload) =>
    set({
      status: 'success',
      tokens: payload.tokens,
      ast: payload.ast,
      semanticModel: payload.semanticModel,
      ir: payload.ir,
      optimizedIR: payload.optimizedIR,
      optimizationPasses: payload.optimizationPasses,
      assembly: payload.assembly,
      stageMetrics: payload.stageMetrics,
      lastCompileDurationMs: payload.lastCompileDurationMs,
      diagnostics: [],
    }),

  setCompileError: (errors, intermediateOutputs = {}) =>
    set({
      status: 'error',
      diagnostics: errors,
      ...intermediateOutputs,
    }),
}))
