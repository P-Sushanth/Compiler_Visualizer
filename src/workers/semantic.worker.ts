import type { WorkerRequest, WorkerResponse } from '../types/worker';
import type { SemanticOutput } from '../types/pipeline';
import type { 
  AST, 
  ASTNode, 
  SymbolEntry, 
  Scope, 
  CompilerDiagnostic 
} from '../types/compiler';

export class SemanticAnalyzer {
  private scopes: Record<string, Scope> = {};
  private symbols: Record<string, SymbolEntry> = {};
  private errors: CompilerDiagnostic[] = [];
  
  private currentScopeId: string | null = null;
  private ast: AST;

  private idCounter = 0;

  constructor(ast: AST) {
    this.ast = ast;
  }

  private createId(prefix = 's'): string {
    return `${prefix}_${this.idCounter++}`;
  }

  private enterScope() {
    const id = this.createId();
    this.scopes[id] = {
      id,
      parentScopeId: this.currentScopeId,
      symbolIds: []
    };
    this.currentScopeId = id;
    return id;
  }

  private leaveScope() {
    if (this.currentScopeId) {
      this.currentScopeId = this.scopes[this.currentScopeId].parentScopeId;
    }
  }

  private declareSymbol(name: string, symbolType: string, declarationNodeId: string, nodeRange: any) {
    if (!this.currentScopeId) return;

    // Check for redeclaration in CURRENT scope
    const currentScope = this.scopes[this.currentScopeId];
    for (const symId of currentScope.symbolIds) {
      if (this.symbols[symId].name === name) {
        this.errors.push({
          id: this.createId(),
          severity: 'error',
          message: "Redeclaration of '" + name + "'",
          stage: 'semantic',
          range: nodeRange
        });
        return;
      }
    }

    const id = this.createId();
    const symbol: SymbolEntry = {
      id,
      name,
      symbolType,
      scopeId: this.currentScopeId,
      declarationNodeId
    };

    this.symbols[id] = symbol;
    currentScope.symbolIds.push(id);
  }

  private resolveSymbol(name: string, nodeRange: any): SymbolEntry | null {
    let scopeId = this.currentScopeId;
    while (scopeId) {
      const scope = this.scopes[scopeId];
      for (const symId of scope.symbolIds) {
        if (this.symbols[symId].name === name) {
          return this.symbols[symId];
        }
      }
      scopeId = scope.parentScopeId;
    }

    this.errors.push({
      id: this.createId(),
      severity: 'error',
      message: "Undeclared identifier '" + name + "'",
      stage: 'semantic',
      range: nodeRange
    });
    return null;
  }

  public analyze(): SemanticOutput {
    if (!this.ast || !this.ast.rootId) {
      return {
        semanticModel: { symbols: {}, scopes: {} },
        errors: [],
        durationMs: 0
      };
    }

    this.enterScope(); // Global scope
    this.declareSymbol('printf', 'function', 'builtin_printf', null);
    this.declareSymbol('scanf', 'function', 'builtin_scanf', null);
    this.visit(this.ast.nodes[this.ast.rootId]);
    this.leaveScope();

    return {
      semanticModel: {
        symbols: this.symbols,
        scopes: this.scopes
      },
      errors: this.errors,
      durationMs: 0
    };
  }

  private visit(node: ASTNode) {
    if (!node) return;

    switch (node.type) {
      case 'Program':
      case 'BlockStatement':
        const isBlock = node.type === 'BlockStatement';
        if (isBlock) this.enterScope();
        for (const childId of (node as any).body) {
          this.visit(this.ast.nodes[childId]);
        }
        if (isBlock) this.leaveScope();
        break;

      case 'FunctionDeclaration':
        const fnNode = node as any;
        this.declareSymbol(fnNode.identifier, 'function', fnNode.id, fnNode.range);
        this.enterScope();
        if (fnNode.params) {
          for (const paramId of fnNode.params) {
            const paramNode = this.ast.nodes[paramId];
            if (paramNode) {
              this.visit(paramNode);
            }
          }
        }
        this.visit(this.ast.nodes[fnNode.body]);
        this.leaveScope();
        break;

      case 'VariableDeclaration':
        const varNode = node as any;
        this.declareSymbol(varNode.identifier, varNode.varType || 'variable', varNode.id, varNode.range);
        if (varNode.value) {
          this.visit(this.ast.nodes[varNode.value]);
        }
        break;

      case 'IfStatement':
        const ifNode = node as any;
        this.visit(this.ast.nodes[ifNode.test]);
        this.visit(this.ast.nodes[ifNode.consequent]);
        if (ifNode.alternate) {
          this.visit(this.ast.nodes[ifNode.alternate]);
        }
        break;

      case 'ForStatement':
        const forNode = node as any;
        this.enterScope(); // For loop creates its own block scope for init
        if (forNode.init) this.visit(this.ast.nodes[forNode.init]);
        if (forNode.test) this.visit(this.ast.nodes[forNode.test]);
        if (forNode.update) this.visit(this.ast.nodes[forNode.update]);
        this.visit(this.ast.nodes[forNode.body]);
        this.leaveScope();
        break;

      case 'ReturnStatement':
        const retNode = node as any;
        if (retNode.argument) {
          this.visit(this.ast.nodes[retNode.argument]);
        }
        break;

      case 'ExpressionStatement':
        const exprStmt = node as any;
        this.visit(this.ast.nodes[exprStmt.expression]);
        break;

      case 'BinaryExpression':
        const binNode = node as any;
        this.visit(this.ast.nodes[binNode.left]);
        this.visit(this.ast.nodes[binNode.right]);
        break;

      case 'CallExpression':
        const callNode = node as any;
        this.visit(this.ast.nodes[callNode.callee]);
        for (const argId of callNode.arguments) {
          this.visit(this.ast.nodes[argId]);
        }
        break;

      case 'Identifier':
        const idNode = node as any;
        this.resolveSymbol(idNode.name, idNode.range);
        break;
        
      case 'Literal':
        break;
    }
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest<AST>>) => {
  const request = event.data;
  
  const startTime = performance.now();
  const analyzer = new SemanticAnalyzer(request.payload);
  const result = analyzer.analyze();
  result.durationMs = performance.now() - startTime;

  const response: WorkerResponse<SemanticOutput> = {
    requestId: request.requestId,
    success: true,
    data: result,
    error: null,
  };
  
  self.postMessage(response);
};
