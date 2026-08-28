import { describe, it, expect } from 'vitest';
import { lex } from '../lexer.worker';
import { Parser } from '../parser.worker';

describe('Parser', () => {
  it('should parse basic variable declaration', () => {
    const { tokens, errors: lexErrors } = lex('int x = 42;');
    expect(lexErrors).toHaveLength(0);

    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();

    expect(errors).toHaveLength(0);
    expect(ast.rootId).toBeDefined();

    const rootNode = ast.nodes[ast.rootId];
    expect(rootNode.type).toBe('Program');

    const bodyNodeIds = (rootNode as any).body;
    expect(bodyNodeIds).toHaveLength(1);

    const declNode = ast.nodes[bodyNodeIds[0]];
    expect(declNode.type).toBe('VariableDeclaration');
    expect((declNode as any).varType).toBe('int');
    expect((declNode as any).identifier).toBe('x');
    expect((declNode as any).value).toBeDefined();

    const initNode = ast.nodes[(declNode as any).value];
    expect(initNode.type).toBe('Literal');
    expect((initNode as any).value).toBe(42);
  });

  it('should parse simple function declaration with block statements', () => {
    const code = `
      void main() {
        int x = 5;
        return;
      }
    `;
    const { tokens } = lex(code);
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();

    expect(errors).toHaveLength(0);

    const rootNode = ast.nodes[ast.rootId];
    const bodyNodeIds = (rootNode as any).body;
    expect(bodyNodeIds).toHaveLength(1);

    const funcNode = ast.nodes[bodyNodeIds[0]];
    expect(funcNode.type).toBe('FunctionDeclaration');
    expect((funcNode as any).identifier).toBe('main');
    expect((funcNode as any).returnType).toBe('void');

    const funcBody = ast.nodes[(funcNode as any).body];
    expect(funcBody.type).toBe('BlockStatement');
    expect((funcBody as any).body).toHaveLength(2);
  });

  it('should report parser error on missing semicolon', () => {
    const { tokens } = lex('int x = 5');
    const parser = new Parser(tokens);
    const { errors } = parser.parse();

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toContain('Expect ";"');
  });

  it('should parse binary expression', () => {
    const { tokens } = lex('int x = 5 + 3;');
    const parser = new Parser(tokens);
    const { ast, errors } = parser.parse();

    expect(errors).toHaveLength(0);
    const rootNode = ast.nodes[ast.rootId];
    const declId = (rootNode as any).body[0];
    const declNode = ast.nodes[declId] as any;
    
    const initNode = ast.nodes[declNode.value] as any;
    expect(initNode.type).toBe('BinaryExpression');
    expect(initNode.operator).toBe('+');
    expect(ast.nodes[initNode.left].type).toBe('Literal');
    expect(ast.nodes[initNode.right].type).toBe('Literal');
  });
});
