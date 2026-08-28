import type { WorkerRequest, WorkerResponse } from '../types/worker'
import type { LexerOutput } from '../types/pipeline'
import type {
  Token,
  TokenType,
  CompilerDiagnostic,
  SourcePosition,
} from '../types/compiler'

const KEYWORDS = new Set([
  'int',
  'return',
  'if',
  'else',
  'while',
  'for',
  'void',
  'char',
  'float',
  'double',
  'break',
  'continue',
])

const OPERATORS = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '=',
  '==',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',
  '!',
  '++',
  '--',
])

const DELIMITERS = new Set(['(', ')', '{', '}', '[', ']', ';', ',', '.'])

let idCounter = 0
const generateId = (prefix: string) => `${prefix}_${idCounter++}`

export function lex(sourceCode: string): {
  tokens: Token[]
  errors: CompilerDiagnostic[]
} {
  idCounter = 0
  const tokens: Token[] = []
  const errors: CompilerDiagnostic[] = []

  let offset = 0
  let line = 1
  let column = 1

  const advance = (n: number = 1) => {
    for (let i = 0; i < n; i++) {
      if (sourceCode[offset] === '\n') {
        line++
        column = 1
      } else {
        column++
      }
      offset++
    }
  }

  const getPosition = (): SourcePosition => ({ line, column, offset })

  while (offset < sourceCode.length) {
    const char = sourceCode[offset]
    const startPos = getPosition()

    // Whitespace
    if (/\s/.test(char)) {
      let value = ''
      while (offset < sourceCode.length && /\s/.test(sourceCode[offset])) {
        value += sourceCode[offset]
        advance()
      }
      tokens.push({
        id: generateId('t'),
        type: 'whitespace',
        value,
        range: { start: startPos, end: getPosition() },
        length: value.length,
      })
      continue
    }

    // Comments
    if (char === '/' && sourceCode[offset + 1] === '/') {
      let value = ''
      while (offset < sourceCode.length && sourceCode[offset] !== '\n') {
        value += sourceCode[offset]
        advance()
      }
      tokens.push({
        id: generateId('t'),
        type: 'comment',
        value,
        range: { start: startPos, end: getPosition() },
        length: value.length,
      })
      continue
    }

    if (char === '/' && sourceCode[offset + 1] === '*') {
      let value = '/*'
      advance(2)
      while (
        offset < sourceCode.length &&
        !(sourceCode[offset] === '*' && sourceCode[offset + 1] === '/')
      ) {
        value += sourceCode[offset]
        advance()
      }
      if (offset < sourceCode.length) {
        value += '*/'
        advance(2)
      } else {
        errors.push({
          id: generateId('err'),
          severity: 'error',
          message: 'Unterminated block comment',
          stage: 'lexer',
          range: { start: startPos, end: getPosition() },
        })
      }
      tokens.push({
        id: generateId('t'),
        type: 'comment',
        value,
        range: { start: startPos, end: getPosition() },
        length: value.length,
      })
      continue
    }

    // Identifiers and Keywords
    if (/[a-zA-Z_]/.test(char)) {
      let value = ''
      while (
        offset < sourceCode.length &&
        /[a-zA-Z0-9_]/.test(sourceCode[offset])
      ) {
        value += sourceCode[offset]
        advance()
      }
      const type: TokenType = KEYWORDS.has(value) ? 'keyword' : 'identifier'
      tokens.push({
        id: generateId('t'),
        type,
        value,
        range: { start: startPos, end: getPosition() },
        length: value.length,
      })
      continue
    }

    // Numbers
    if (/[0-9]/.test(char)) {
      let value = ''
      let hasDecimal = false
      while (
        offset < sourceCode.length &&
        (/[0-9]/.test(sourceCode[offset]) ||
          (sourceCode[offset] === '.' && !hasDecimal))
      ) {
        if (sourceCode[offset] === '.') hasDecimal = true
        value += sourceCode[offset]
        advance()
      }
      tokens.push({
        id: generateId('t'),
        type: 'number',
        value,
        range: { start: startPos, end: getPosition() },
        length: value.length,
      })
      continue
    }

    // Strings
    if (char === '"' || char === "'") {
      const quote = char
      let value = quote
      advance()
      while (offset < sourceCode.length && sourceCode[offset] !== quote) {
        if (sourceCode[offset] === '\\' && offset + 1 < sourceCode.length) {
          value += sourceCode[offset]
          advance()
        }
        if (sourceCode[offset] === '\n') {
          errors.push({
            id: generateId('err'),
            severity: 'error',
            message: 'Unterminated string literal',
            stage: 'lexer',
            range: { start: startPos, end: getPosition() },
          })
          break
        }
        value += sourceCode[offset]
        advance()
      }
      if (offset < sourceCode.length && sourceCode[offset] === quote) {
        value += quote
        advance()
      }
      tokens.push({
        id: generateId('t'),
        type: 'string',
        value,
        range: { start: startPos, end: getPosition() },
        length: value.length,
      })
      continue
    }

    // Operators and Delimiters
    let matched = false
    // Check 2-char operators first
    if (offset + 1 < sourceCode.length) {
      const op2 = sourceCode.slice(offset, offset + 2)
      if (OPERATORS.has(op2)) {
        advance(2)
        tokens.push({
          id: generateId('t'),
          type: 'operator',
          value: op2,
          range: { start: startPos, end: getPosition() },
          length: 2,
        })
        matched = true
      }
    }

    if (!matched) {
      const singleChar = sourceCode[offset]
      if (OPERATORS.has(singleChar)) {
        advance()
        tokens.push({
          id: generateId('t'),
          type: 'operator',
          value: singleChar,
          range: { start: startPos, end: getPosition() },
          length: 1,
        })
        matched = true
      } else if (DELIMITERS.has(singleChar)) {
        advance()
        tokens.push({
          id: generateId('t'),
          type: 'delimiter',
          value: singleChar,
          range: { start: startPos, end: getPosition() },
          length: 1,
        })
        matched = true
      }
    }

    if (!matched) {
      // Unknown character
      const unknownChar = sourceCode[offset]
      advance()
      errors.push({
        id: generateId('err'),
        severity: 'error',
        message: `Unexpected character: ${unknownChar}`,
        stage: 'lexer',
        range: { start: startPos, end: getPosition() },
      })
      tokens.push({
        id: generateId('t'),
        type: 'unknown',
        value: unknownChar,
        range: { start: startPos, end: getPosition() },
        length: 1,
      })
    }
  }

  return { tokens, errors }
}

self.onmessage = (event: MessageEvent<WorkerRequest<string>>) => {
  const request = event.data

  const startTime = performance.now()
  const { tokens, errors } = lex(request.payload)
  const durationMs = performance.now() - startTime

  const response: WorkerResponse<LexerOutput> = {
    requestId: request.requestId,
    success: true,
    data: { tokens, errors, durationMs },
    error: null,
  }

  self.postMessage(response)
}
