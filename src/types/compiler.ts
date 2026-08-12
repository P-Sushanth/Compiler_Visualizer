export type SourcePosition = {
  line: number;
  column: number;
  offset: number;
};

export type SourceRange = {
  start: SourcePosition;
  end: SourcePosition;
};

export type CompilerStage =
  | "lexer"
  | "parser"
  | "semantic"
  | "ir"
  | "optimizer"
  | "assembly"
  | "compare";

export type TokenType =
  | "keyword"
  | "identifier"
  | "number"
  | "string"
  | "operator"
  | "delimiter"
  | "comment"
  | "whitespace"
  | "unknown";

export type Token = {
  id: string;
  type: TokenType;
  value: string;
  range: SourceRange;
  length: number;
};

export type CompilerDiagnostic = {
  id: string;
  severity: "info" | "warning" | "error";
  message: string;
  stage: CompilerStage;
  range: SourceRange | null;
};

export type ASTNodeBase = {
  id: string;
  type: string;
  range: SourceRange;
  children: string[];
};

export type ProgramNode = ASTNodeBase & {
  type: "Program";
  body: string[];
};

export type FunctionDeclarationNode = ASTNodeBase & {
  type: "FunctionDeclaration";
  identifier: string;
  returnType: string;
  params: string[];
  body: string;
};

export type BlockStatementNode = ASTNodeBase & {
  type: "BlockStatement";
  body: string[];
};

export type ReturnStatementNode = ASTNodeBase & {
  type: "ReturnStatement";
  argument: string | null;
};

export type VariableDeclarationNode = ASTNodeBase & {
  type: "VariableDeclaration";
  identifier: string;
  value: string | null;
  varType?: string;
};

export type BinaryExpressionNode = ASTNodeBase & {
  type: "BinaryExpression";
  operator: string;
  left: string;
  right: string;
};

export type IfStatementNode = ASTNodeBase & {
  type: "IfStatement";
  test: string;
  consequent: string;
  alternate: string | null;
};

export type ForStatementNode = ASTNodeBase & {
  type: "ForStatement";
  init: string | null;
  test: string | null;
  update: string | null;
  body: string;
};

export type ExpressionStatementNode = ASTNodeBase & {
  type: "ExpressionStatement";
  expression: string;
};

export type CallExpressionNode = ASTNodeBase & {
  type: "CallExpression";
  callee: string;
  arguments: string[];
};

export type LiteralNode = ASTNodeBase & {
  type: "Literal";
  value: string | number | boolean;
  literalType: "string" | "number" | "boolean";
};

export type IdentifierNode = ASTNodeBase & {
  type: "Identifier";
  name: string;
};

export type ASTNode =
  | ProgramNode
  | FunctionDeclarationNode
  | BlockStatementNode
  | ReturnStatementNode
  | VariableDeclarationNode
  | BinaryExpressionNode
  | IfStatementNode
  | ForStatementNode
  | ExpressionStatementNode
  | CallExpressionNode
  | LiteralNode
  | IdentifierNode;

export type AST = {
  rootId: string;
  nodes: Record<string, ASTNode>;
  nodeCount: number;
};

// Semantic Model
export type SymbolEntry = {
  id: string;
  name: string;
  symbolType: string;
  scopeId: string;
  declarationNodeId: string;
};

export type Scope = {
  id: string;
  parentScopeId: string | null;
  symbolIds: string[];
};

export type SemanticModel = {
  symbols: Record<string, SymbolEntry>;
  scopes: Record<string, Scope>;
};

// IR Model
export type IRInstruction = {
  id: string;
  opcode: string;
  operands: string[];
  result: string | null;
  blockId: string;
  sourceNodeId: string | null;
};

export type BasicBlock = {
  id: string;
  label: string;
  instructionIds: string[];
  successorBlockIds: string[];
};

export type IRProgram = {
  blocks: Record<string, BasicBlock>;
  instructions: Record<string, IRInstruction>;
  entryBlockId: string;
};
