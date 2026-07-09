Purpose

This document defines:

compiler pipeline stages
data contracts between stages
JSON schemas
shared interfaces
worker communication formats

The goal is to prevent:

inconsistent AST structures
incompatible worker outputs
duplicated schemas
ad-hoc data formats

All compiler stages MUST follow these contracts strictly.

Pipeline Overview
Source Code
    ↓
Lexer
    ↓
Tokens
    ↓
Parser
    ↓
AST
    ↓
Semantic Analysis
    ↓
Semantic Model
    ↓
Intermediate Representation (IR)
    ↓
Optimization Passes
    ↓
Optimized IR
    ↓
Assembly / Machine Code
Global Rules
Mandatory Rules
Every node MUST have a stable ID
Every structure MUST contain source location info
Every worker response MUST be serializable
No circular references allowed
Parent references must use IDs only
Large payload duplication is forbidden
Shared Primitive Types
SourcePosition
export type SourcePosition = {
  line: number
  column: number
  offset: number
}
SourceRange
export type SourceRange = {
  start: SourcePosition
  end: SourcePosition
}
CompilerStage
export type CompilerStage =
  | "lexer"
  | "parser"
  | "semantic"
  | "ir"
  | "optimizer"
  | "assembly"
Lexer Specification
Token Type
export type Token = {
  id: string

  type: TokenType

  value: string

  range: SourceRange

  length: number
}
TokenType
export type TokenType =
  | "keyword"
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "delimiter"
  | "comment"
  | "whitespace"
  | "unknown"
Lexer Output
export type LexerOutput = {
  tokens: Token[]

  errors: CompilerDiagnostic[]

  durationMs: number
}
Parser Specification
AST Base Node

ALL AST nodes MUST extend this structure.

export type ASTNodeBase = {
  id: string

  type: string

  range: SourceRange

  children: string[]
}
AST Node Types
Program Node
export type ProgramNode = ASTNodeBase & {
  type: "Program"

  body: string[]
}
Variable Declaration
export type VariableDeclarationNode = ASTNodeBase & {
  type: "VariableDeclaration"

  identifier: string

  value: string | null
}
Binary Expression
export type BinaryExpressionNode = ASTNodeBase & {
  type: "BinaryExpression"

  operator: string

  left: string

  right: string
}
Literal Node
export type LiteralNode = ASTNodeBase & {
  type: "Literal"

  value: string | number | boolean

  literalType: "string" | "number" | "boolean"
}
AST Container

AST nodes MUST be normalized.

DO NOT nest huge child objects recursively.

AST Structure
export type AST = {
  rootId: string

  nodes: Record<string, ASTNode>

  nodeCount: number
}
ASTNode Union
export type ASTNode =
  | ProgramNode
  | VariableDeclarationNode
  | BinaryExpressionNode
  | LiteralNode
Parser Output
export type ParserOutput = {
  ast: AST

  errors: CompilerDiagnostic[]

  durationMs: number
}
Semantic Analysis Specification
Symbol Table Entry
export type SymbolEntry = {
  id: string

  name: string

  symbolType: string

  scopeId: string

  declarationNodeId: string
}
Scope
export type Scope = {
  id: string

  parentScopeId: string | null

  symbolIds: string[]
}
Semantic Model
export type SemanticModel = {
  symbols: Record<string, SymbolEntry>

  scopes: Record<string, Scope>
}
Semantic Output
export type SemanticOutput = {
  semanticModel: SemanticModel

  errors: CompilerDiagnostic[]

  durationMs: number
}
Intermediate Representation (IR)
IR Instruction
export type IRInstruction = {
  id: string

  opcode: string

  operands: string[]

  result: string | null

  blockId: string

  sourceNodeId: string | null
}
Basic Block
export type BasicBlock = {
  id: string

  label: string

  instructionIds: string[]

  successorBlockIds: string[]
}
IR Program
export type IRProgram = {
  blocks: Record<string, BasicBlock>

  instructions: Record<string, IRInstruction>

  entryBlockId: string
}
IR Output
export type IROutput = {
  ir: IRProgram

  errors: CompilerDiagnostic[]

  durationMs: number
}
Optimization Specification
Optimization Pass Result
export type OptimizationPassResult = {
  passName: string

  modified: boolean

  beforeIR: IRProgram

  afterIR: IRProgram

  explanation: string
}
Optimizer Output
export type OptimizerOutput = {
  optimizedIR: IRProgram

  passes: OptimizationPassResult[]

  errors: CompilerDiagnostic[]

  durationMs: number
}
Assembly Specification
Assembly Instruction
export type AssemblyInstruction = {
  id: string

  opcode: string

  operands: string[]

  sourceInstructionId: string | null
}
Assembly Program
export type AssemblyProgram = {
  instructions: AssemblyInstruction[]
}
Assembly Output
export type AssemblyOutput = {
  assembly: AssemblyProgram

  errors: CompilerDiagnostic[]

  durationMs: number
}
Diagnostics Specification
CompilerDiagnostic
export type CompilerDiagnostic = {
  id: string

  severity: "info" | "warning" | "error"

  message: string

  stage: CompilerStage

  range: SourceRange | null
}
Worker Communication Specification
Worker Request
export type WorkerRequest<TPayload> = {
  requestId: string

  timestamp: number

  payload: TPayload
}
Worker Response
export type WorkerResponse<TData> = {
  requestId: string

  success: boolean

  data: TData | null

  error: string | null
}
Pipeline Event Specification
Pipeline Status
export type PipelineStatus =
  | "idle"
  | "running"
  | "success"
  | "error"
Pipeline Stage State
export type PipelineStageState = {
  stage: CompilerStage

  status: PipelineStatus

  durationMs: number | null
}
Visualization Metadata
AST Visualization Node

Separate visualization data from compiler data.

export type ASTVisualizationNode = {
  id: string

  x: number

  y: number

  width: number

  height: number

  collapsed: boolean
}
Performance Constraints
Hard Limits
export const PIPELINE_LIMITS = {
  MAX_SOURCE_SIZE: 1_000_000,
  MAX_AST_NODES: 10_000,
  MAX_TOKENS: 50_000,
  MAX_IR_INSTRUCTIONS: 20_000
}
Serialization Rules
Forbidden
circular references
class instances
functions
DOM nodes
Maps/Sets in worker payloads
Allowed
plain objects
arrays
primitives
normalized structures
ID Rules

All IDs MUST:

be stable
be unique
use string format

Example:

node_001
token_014
block_002
Error Handling Rules
Mandatory

Every stage MUST:

return diagnostics
never throw uncaught exceptions
fail gracefully
preserve partial outputs when possible
Versioning
Schema Version
export const PIPELINE_SCHEMA_VERSION = "1.0.0"

Breaking schema changes MUST increment version.