import { describe, it, expect } from 'vitest';
import { lex } from '../lexer.worker';

describe('Lexer (Tokenizer)', () => {
  it('should tokenize basic C variable declaration and assignment', () => {
    const source = 'int x = 10;';
    const { tokens, errors } = lex(source);

    expect(errors).toHaveLength(0);
    
    // We expect: whitespace, int (keyword), whitespace, x (identifier), whitespace, = (operator), whitespace, 10 (number), ; (delimiter)
    // Filter out whitespace for easier assertion
    const nonWsTokens = tokens.filter(t => t.type !== 'whitespace');
    
    expect(nonWsTokens).toHaveLength(5);
    expect(nonWsTokens[0]).toMatchObject({ type: 'keyword', value: 'int' });
    expect(nonWsTokens[1]).toMatchObject({ type: 'identifier', value: 'x' });
    expect(nonWsTokens[2]).toMatchObject({ type: 'operator', value: '=' });
    expect(nonWsTokens[3]).toMatchObject({ type: 'number', value: '10' });
    expect(nonWsTokens[4]).toMatchObject({ type: 'delimiter', value: ';' });
  });

  it('should tokenize operators and delimiters correctly', () => {
    const source = 'x == y + 5.5;';
    const { tokens, errors } = lex(source);

    expect(errors).toHaveLength(0);
    const nonWsTokens = tokens.filter(t => t.type !== 'whitespace');
    
    expect(nonWsTokens[1]).toMatchObject({ type: 'operator', value: '==' });
    expect(nonWsTokens[3]).toMatchObject({ type: 'operator', value: '+' });
    expect(nonWsTokens[4]).toMatchObject({ type: 'number', value: '5.5' });
  });

  it('should handle comments', () => {
    const source = '// single line comment\nint x; /* block\ncomment */';
    const { tokens, errors } = lex(source);

    expect(errors).toHaveLength(0);
    const commentTokens = tokens.filter(t => t.type === 'comment');
    expect(commentTokens).toHaveLength(2);
    expect(commentTokens[0].value).toBe('// single line comment');
    expect(commentTokens[1].value).toBe('/* block\ncomment */');
  });

  it('should report error for unterminated block comment', () => {
    const source = 'int x; /* unterminated';
    const { tokens, errors } = lex(source);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Unterminated block comment');
    expect(tokens.filter(t => t.type === 'comment')[0].value).toBe('/* unterminated');
  });

  it('should report error for unterminated string literal', () => {
    const source = 'char* s = "unterminated\n;';
    const { tokens, errors } = lex(source);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Unterminated string literal');
  });

  it('should report error for unexpected character', () => {
    const source = 'int x = 10 @;';
    const { tokens, errors } = lex(source);

    expect(errors).toHaveLength(1);
    expect(errors[0].message).toBe('Unexpected character: @');
    
    const unknownToken = tokens.find(t => t.type === 'unknown');
    expect(unknownToken).toBeDefined();
    expect(unknownToken?.value).toBe('@');
  });
});
