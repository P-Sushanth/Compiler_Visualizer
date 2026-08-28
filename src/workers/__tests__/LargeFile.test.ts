import { describe, it, expect } from 'vitest'
import { lex } from '../lexer.worker'
import { Parser } from '../parser.worker'
import { SemanticAnalyzer } from '../semantic.worker'
import { IRGenerator } from '../ir.worker'

describe('Compiler Stress & Performance Test (Large File)', () => {
  it('should compile a large C source file with many statements without crashing', () => {
    // Generate a C program with 500 variable declarations and additions
    let declarations = ''
    for (let i = 0; i < 500; i++) {
      declarations += `  int x_${i} = ${i} + 10;\n`
    }

    const sourceCode = `
      void main() {
        ${declarations}
      }
    `

    // 1. Lexer Stage
    const lexStart = performance.now()
    const { tokens, errors: lexErrors } = lex(sourceCode)
    const lexDuration = performance.now() - lexStart

    expect(lexErrors).toHaveLength(0)
    expect(tokens.length).toBeGreaterThan(2500) // 5 tokens per declaration plus wrapper
    console.log(
      `Lexer processed ${tokens.length} tokens in ${lexDuration.toFixed(2)}ms`,
    )

    // 2. Parser Stage
    const parseStart = performance.now()
    const parser = new Parser(tokens)
    const { ast, errors: parseErrors } = parser.parse()
    const parseDuration = performance.now() - parseStart

    expect(parseErrors).toHaveLength(0)
    expect(Object.keys(ast.nodes).length).toBeGreaterThan(1500)
    console.log(
      `Parser parsed ${Object.keys(ast.nodes).length} nodes in ${parseDuration.toFixed(2)}ms`,
    )

    // 3. Semantic Analysis Stage
    const semanticStart = performance.now()
    const analyzer = new SemanticAnalyzer(ast)
    const { semanticModel, errors: semanticErrors } = analyzer.analyze()
    const semanticDuration = performance.now() - semanticStart

    expect(semanticErrors).toHaveLength(0)
    expect(Object.keys(semanticModel.symbols).length).toBe(503) // 500 declared variables + 2 builtins + main function
    console.log(
      `Semantic Analyzer processed ${Object.keys(semanticModel.symbols).length} symbols in ${semanticDuration.toFixed(2)}ms`,
    )

    // 4. IR Generation Stage
    const irStart = performance.now()
    const generator = new IRGenerator(ast)
    const { ir, errors: irErrors } = generator.generate()
    const irDuration = performance.now() - irStart

    expect(irErrors).toHaveLength(0)
    expect(Object.keys(ir.instructions).length).toBeGreaterThan(1000)
    console.log(
      `IR Generator generated ${Object.keys(ir.instructions).length} instructions in ${irDuration.toFixed(2)}ms`,
    )

    // Basic sanity checks on performance thresholds
    // Even on weak hardware in jsdom environment, 500 simple lines should compile well under 1 second.
    const totalDuration =
      lexDuration + parseDuration + semanticDuration + irDuration
    expect(totalDuration).toBeLessThan(1000)
  })
})
