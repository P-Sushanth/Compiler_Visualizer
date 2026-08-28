import { describe, it, expect } from 'vitest'
import { lex } from '../lexer.worker'
import { Parser } from '../parser.worker'
import { SemanticAnalyzer } from '../semantic.worker'

describe('Semantic Analyzer', () => {
  it('should declare symbols in symbol table', () => {
    const { tokens } = lex('int x = 5;')
    const { ast } = new Parser(tokens).parse()

    const analyzer = new SemanticAnalyzer(ast)
    const { semanticModel, errors } = analyzer.analyze()

    expect(errors).toHaveLength(0)

    const symbols = Object.values(semanticModel.symbols)
    expect(symbols.length).toBeGreaterThanOrEqual(1)
    const userSymbol = symbols.find((s) => s.name === 'x')
    expect(userSymbol).toBeDefined()
    expect(userSymbol).toMatchObject({
      name: 'x',
      symbolType: 'int',
    })
  })

  it('should create scopes for block statements', () => {
    const code = `
      void main() {
        int x = 5;
        {
          int y = 10;
        }
      }
    `
    const { tokens } = lex(code)
    const { ast } = new Parser(tokens).parse()

    const analyzer = new SemanticAnalyzer(ast)
    const { semanticModel, errors } = analyzer.analyze()

    expect(errors).toHaveLength(0)

    const scopes = Object.values(semanticModel.scopes)
    // Expected scopes: global scope, main function body block, nested block
    expect(scopes.length).toBeGreaterThanOrEqual(3)

    // Check that symbols are associated with correct scopeIds
    const symX = Object.values(semanticModel.symbols).find(
      (s) => s.name === 'x',
    )
    const symY = Object.values(semanticModel.symbols).find(
      (s) => s.name === 'y',
    )

    expect(symX).toBeDefined()
    expect(symY).toBeDefined()
    expect(symX?.scopeId).not.toBe(symY?.scopeId)
  })

  it('should allow redeclaring variables in different scopes', () => {
    const code = `
      int x = 5;
      void main() {
        int x = 10;
      }
    `
    const { tokens } = lex(code)
    const { ast } = new Parser(tokens).parse()

    const analyzer = new SemanticAnalyzer(ast)
    const { errors } = analyzer.analyze()

    expect(errors).toHaveLength(0)
  })

  it('should flag error on redeclaring variable in same scope', () => {
    const code = `
      int x = 5;
      int x = 10;
    `
    const { tokens } = lex(code)
    const { ast } = new Parser(tokens).parse()

    const analyzer = new SemanticAnalyzer(ast)
    const { errors } = analyzer.analyze()

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].message).toContain("Redeclaration of 'x'")
  })

  it('should flag error on undeclared identifier', () => {
    const code = `
      void main() {
        x = 10;
      }
    `
    const { tokens } = lex(code)
    const { ast } = new Parser(tokens).parse()

    const analyzer = new SemanticAnalyzer(ast)
    const { errors } = analyzer.analyze()

    expect(errors.length).toBeGreaterThan(0)
    expect(errors[0].message).toContain("Undeclared identifier 'x'")
  })
})
