import type { WorkerRequest, WorkerResponse } from '../types/worker'
import type { ParserOutput } from '../types/pipeline'
import type {
  Token,
  ASTNode,
  CompilerDiagnostic,
  ProgramNode,
  FunctionDeclarationNode,
  BlockStatementNode,
  VariableDeclarationNode,
  IfStatementNode,
  ForStatementNode,
  ReturnStatementNode,
  ExpressionStatementNode,
  BinaryExpressionNode,
  CallExpressionNode,
  LiteralNode,
  IdentifierNode,
} from '../types/compiler'

export class Parser {
  private current = 0
  private nodes: Record<string, ASTNode> = {}
  private tokens: Token[]
  private errors: CompilerDiagnostic[] = []

  constructor(tokens: Token[]) {
    this.tokens = tokens
  }

  private isAtEnd(): boolean {
    return this.current >= this.tokens.length
  }

  private peek(): Token {
    return this.tokens[this.current]
  }

  private previous(): Token {
    return this.tokens[this.current - 1]
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  private match(...types: string[]): boolean {
    if (this.isAtEnd()) return false
    const type = this.peek().type
    const value = this.peek().value
    // We treat keywords/delimiters as direct matches on value
    for (const t of types) {
      if (value === t || type === t) {
        this.advance()
        return true
      }
    }
    return false
  }

  private consume(typeOrValue: string, message: string): Token {
    if (
      !this.isAtEnd() &&
      (this.peek().type === typeOrValue || this.peek().value === typeOrValue)
    ) {
      return this.advance()
    }
    this.error(this.peek(), message)
    return this.peek() // return current to avoid crash, but it's an error
  }

  private idCounter = 0

  private error(token: Token | undefined, message: string) {
    this.errors.push({
      id: this.createId('err'),
      severity: 'error',
      message,
      stage: 'parser',
      range: token ? token.range : null,
    })
  }

  private addNode(node: ASTNode): string {
    this.nodes[node.id] = node
    return node.id
  }

  private createId(prefix = 'n'): string {
    return `${prefix}_${this.idCounter++}`
  }

  // --- Parsing Logic ---

  public parse(): ParserOutput {
    // Filter out whitespace and comments
    this.tokens = this.tokens.filter(
      (t) => t.type !== 'whitespace' && t.type !== 'comment',
    )

    const startToken = this.tokens[0]
    const programId = this.createId()
    const body: string[] = []

    while (!this.isAtEnd()) {
      try {
        const decl = this.declaration()
        if (decl) body.push(decl)
      } catch (_e) {
        this.synchronize()
      }
    }

    const programNode: ProgramNode = {
      id: programId,
      type: 'Program',
      range: startToken
        ? {
            start: startToken.range.start,
            end: this.previous()?.range.end || startToken.range.end,
          }
        : {
            start: { line: 0, column: 0, offset: 0 },
            end: { line: 0, column: 0, offset: 0 },
          },
      children: body,
      body,
    }

    this.addNode(programNode)

    return {
      ast: {
        rootId: programId,
        nodes: this.nodes,
        nodeCount: Object.keys(this.nodes).length,
      },
      errors: this.errors,
      durationMs: 0,
    }
  }

  private synchronize() {
    this.advance()
    while (!this.isAtEnd()) {
      if (this.previous().value === ';') return
      switch (this.peek().value) {
        case 'int':
        case 'void':
        case 'if':
        case 'while':
        case 'for':
        case 'return':
          return
      }
      this.advance()
    }
  }

  private declaration(): string | null {
    if (this.match('int', 'void', 'float', 'char')) {
      const typeToken = this.previous()
      const nameToken = this.consume(
        'identifier',
        'Expect identifier after type.',
      )

      if (this.match('(')) {
        return this.functionDeclaration(typeToken, nameToken)
      } else {
        return this.variableDeclaration(typeToken, nameToken)
      }
    }
    return this.statement()
  }

  private functionDeclaration(typeToken: Token, nameToken: Token): string {
    const params: string[] = []
    if (!this.match(')')) {
      do {
        if (this.match('int', 'void', 'float', 'char')) {
          const paramType = this.previous()
          if (paramType.value !== 'void') {
            const paramName = this.consume(
              'identifier',
              'Expect parameter name.',
            )
            const paramId = this.createId()
            const paramNode: VariableDeclarationNode = {
              id: paramId,
              type: 'VariableDeclaration',
              identifier: paramName.value,
              value: null,
              varType: paramType.value,
              range: { start: paramType.range.start, end: paramName.range.end },
              children: [],
            }
            this.addNode(paramNode)
            params.push(paramId)
          }
        }
      } while (this.match(','))
      this.consume(')', 'Expect ")" after parameters.')
    }

    this.consume('{', 'Expect "{" before function body.')
    const body = this.blockStatement()

    const id = this.createId()
    const node: FunctionDeclarationNode = {
      id,
      type: 'FunctionDeclaration',
      identifier: nameToken.value,
      returnType: typeToken.value,
      params,
      body,
      range: { start: typeToken.range.start, end: this.previous().range.end },
      children: [...params, body],
    }
    return this.addNode(node)
  }

  private variableDeclaration(typeToken: Token, nameToken: Token): string {
    let valId: string | null = null

    if (this.match('=')) {
      valId = this.expression()
    }
    this.consume(';', 'Expect ";" after variable declaration.')

    const id = this.createId()
    const node: VariableDeclarationNode = {
      id,
      type: 'VariableDeclaration',
      identifier: nameToken.value,
      value: valId,
      varType: typeToken.value,
      range: { start: typeToken.range.start, end: this.previous().range.end },
      children: valId ? [valId] : [],
    }
    return this.addNode(node)
  }

  private statement(): string {
    if (this.match('if')) return this.ifStatement()
    if (this.match('for')) return this.forStatement()
    if (this.match('return')) return this.returnStatement()
    if (this.match('{')) return this.blockStatement()

    return this.expressionStatement()
  }

  private ifStatement(): string {
    const startToken = this.previous()
    this.consume('(', 'Expect "(" after "if".')
    const test = this.expression()
    this.consume(')', 'Expect ")" after if condition.')

    const consequent = this.statement()
    let alternate: string | null = null
    if (this.match('else')) {
      alternate = this.statement()
    }

    const id = this.createId()
    const children = [test, consequent]
    if (alternate) children.push(alternate)

    const node: IfStatementNode = {
      id,
      type: 'IfStatement',
      test,
      consequent,
      alternate,
      range: { start: startToken.range.start, end: this.previous().range.end },
      children,
    }
    return this.addNode(node)
  }

  private forStatement(): string {
    const startToken = this.previous()
    this.consume('(', 'Expect "(" after "for".')

    let init: string | null = null
    if (this.match(';')) {
      // Empty init
    } else if (this.match('int')) {
      const typeToken = this.previous()
      const nameToken = this.consume('identifier', 'Expect identifier.')
      init = this.variableDeclaration(typeToken, nameToken)
    } else {
      init = this.expressionStatement()
    }

    let test: string | null = null
    if (!this.match(';')) {
      test = this.expression()
      this.consume(';', 'Expect ";" after loop condition.')
    }

    let update: string | null = null
    if (!this.match(')')) {
      update = this.expression()
      this.consume(')', 'Expect ")" after for clauses.')
    }

    const body = this.statement()

    const id = this.createId()
    const children = []
    if (init) children.push(init)
    if (test) children.push(test)
    if (update) children.push(update)
    children.push(body)

    const node: ForStatementNode = {
      id,
      type: 'ForStatement',
      init,
      test,
      update,
      body,
      range: { start: startToken.range.start, end: this.previous().range.end },
      children,
    }
    return this.addNode(node)
  }

  private returnStatement(): string {
    const startToken = this.previous()
    let value: string | null = null
    if (!this.match(';')) {
      value = this.expression()
      this.consume(';', 'Expect ";" after return value.')
    }
    const id = this.createId()
    const node: ReturnStatementNode = {
      id,
      type: 'ReturnStatement',
      argument: value,
      range: { start: startToken.range.start, end: this.previous().range.end },
      children: value ? [value] : [],
    }
    return this.addNode(node)
  }

  private blockStatement(): string {
    const startToken = this.previous()
    const body: string[] = []
    while (!this.match('}') && !this.isAtEnd()) {
      const decl = this.declaration()
      if (decl) body.push(decl)
    }
    const id = this.createId()
    const node: BlockStatementNode = {
      id,
      type: 'BlockStatement',
      body,
      range: { start: startToken.range.start, end: this.previous().range.end },
      children: body,
    }
    return this.addNode(node)
  }

  private expressionStatement(): string {
    const expr = this.expression()
    this.consume(';', 'Expect ";" after expression.')
    const id = this.createId()
    const node: ExpressionStatementNode = {
      id,
      type: 'ExpressionStatement',
      expression: expr,
      range: {
        start: this.nodes[expr].range.start,
        end: this.previous().range.end,
      },
      children: [expr],
    }
    return this.addNode(node)
  }

  private expression(): string {
    return this.assignment()
  }

  private assignment(): string {
    const expr = this.equality()

    if (this.match('=', '+=', '-=')) {
      const operator = this.previous()
      const value = this.assignment()

      const id = this.createId()
      const node: BinaryExpressionNode = {
        id,
        type: 'BinaryExpression',
        operator: operator.value,
        left: expr,
        right: value,
        range: {
          start: this.nodes[expr].range.start,
          end: this.nodes[value].range.end,
        },
        children: [expr, value],
      }
      return this.addNode(node)
    }
    return expr
  }

  private equality(): string {
    let expr = this.comparison()
    while (this.match('==', '!=')) {
      const operator = this.previous()
      const right = this.comparison()
      const id = this.createId()
      const node: BinaryExpressionNode = {
        id,
        type: 'BinaryExpression',
        operator: operator.value,
        left: expr,
        right,
        range: {
          start: this.nodes[expr].range.start,
          end: this.nodes[right].range.end,
        },
        children: [expr, right],
      }
      expr = this.addNode(node)
    }
    return expr
  }

  private comparison(): string {
    let expr = this.term()
    while (this.match('<', '<=', '>', '>=')) {
      const operator = this.previous()
      const right = this.term()
      const id = this.createId()
      const node: BinaryExpressionNode = {
        id,
        type: 'BinaryExpression',
        operator: operator.value,
        left: expr,
        right,
        range: {
          start: this.nodes[expr].range.start,
          end: this.nodes[right].range.end,
        },
        children: [expr, right],
      }
      expr = this.addNode(node)
    }
    return expr
  }

  private term(): string {
    let expr = this.factor()
    while (this.match('+', '-')) {
      const operator = this.previous()
      const right = this.factor()
      const id = this.createId()
      const node: BinaryExpressionNode = {
        id,
        type: 'BinaryExpression',
        operator: operator.value,
        left: expr,
        right,
        range: {
          start: this.nodes[expr].range.start,
          end: this.nodes[right].range.end,
        },
        children: [expr, right],
      }
      expr = this.addNode(node)
    }
    return expr
  }

  private factor(): string {
    let expr = this.unary()
    while (this.match('*', '/', '%')) {
      const operator = this.previous()
      const right = this.unary()
      const id = this.createId()
      const node: BinaryExpressionNode = {
        id,
        type: 'BinaryExpression',
        operator: operator.value,
        left: expr,
        right,
        range: {
          start: this.nodes[expr].range.start,
          end: this.nodes[right].range.end,
        },
        children: [expr, right],
      }
      expr = this.addNode(node)
    }
    return expr
  }

  private unary(): string {
    // simplified
    return this.call()
  }

  private call(): string {
    const expr = this.primary()

    if (this.match('(')) {
      const args: string[] = []
      if (!this.match(')')) {
        do {
          args.push(this.expression())
        } while (this.match(','))
        this.consume(')', 'Expect ")" after arguments.')
      }

      const id = this.createId()
      const node: CallExpressionNode = {
        id,
        type: 'CallExpression',
        callee: expr,
        arguments: args,
        range: {
          start: this.nodes[expr].range.start,
          end: this.previous().range.end,
        },
        children: [expr, ...args],
      }
      return this.addNode(node)
    }

    // Check postfix increment/decrement
    if (this.match('++', '--')) {
      this.previous()
      // treat as a binary expression of a += 1 conceptually for AST or just a custom unary.
      // We'll map to binary for simplicity or just skip deeply modelling it for now.
    }

    return expr
  }

  private primary(): string {
    if (this.match('number')) {
      const token = this.previous()
      const id = this.createId()
      const node: LiteralNode = {
        id,
        type: 'Literal',
        value: parseFloat(token.value),
        literalType: 'number',
        range: token.range,
        children: [],
      }
      return this.addNode(node)
    }

    if (this.match('string')) {
      const token = this.previous()
      const id = this.createId()
      const node: LiteralNode = {
        id,
        type: 'Literal',
        value: token.value,
        literalType: 'string',
        range: token.range,
        children: [],
      }
      return this.addNode(node)
    }

    if (this.match('identifier')) {
      const token = this.previous()
      const id = this.createId()
      const node: IdentifierNode = {
        id,
        type: 'Identifier',
        name: token.value,
        range: token.range,
        children: [],
      }
      return this.addNode(node)
    }

    if (this.match('(')) {
      const expr = this.expression()
      this.consume(')', 'Expect ")" after expression.')
      return expr
    }

    this.error(this.peek(), 'Expect expression.')
    this.advance()
    return this.createId() // dummy to prevent crash
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest<Token[]>>) => {
  const request = event.data

  const startTime = performance.now()
  const parser = new Parser(request.payload)
  const result = parser.parse()
  result.durationMs = performance.now() - startTime

  const response: WorkerResponse<ParserOutput> = {
    requestId: request.requestId,
    success: true,
    data: result,
    error: null,
  }

  self.postMessage(response)
}
