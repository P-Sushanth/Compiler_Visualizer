import type {
  Token,
  AST,
  SemanticModel,
  IRProgram,
  CompilerDiagnostic,
} from './compiler'

export type LexerOutput = {
  tokens: Token[]
  errors: CompilerDiagnostic[]
  durationMs: number
}

export type ParserOutput = {
  ast: AST
  errors: CompilerDiagnostic[]
  durationMs: number
}

export type SemanticOutput = {
  semanticModel: SemanticModel
  errors: CompilerDiagnostic[]
  durationMs: number
}

export type IROutput = {
  ir: IRProgram
  errors: CompilerDiagnostic[]
  durationMs: number
}

export type OptimizationPass = {
  id: string
  name: string
  description: string
  instructionsRemoved: number
  instructionsModified: number
}

export type OptimizerOutput = {
  ir: IRProgram // The optimized IR
  passes: OptimizationPass[]
  errors: CompilerDiagnostic[]
  durationMs: number
}

export type AssemblyInstruction = {
  id: string
  op: string
  args: string[]
  comment?: string
  sourceNodeId?: string | null
}

export type AssemblyOutput = {
  instructions: AssemblyInstruction[]
  errors: CompilerDiagnostic[]
  durationMs: number
}
