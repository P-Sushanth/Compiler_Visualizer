import { describe, it, expect } from 'vitest';
import { lex } from '../lexer.worker';
import { Parser } from '../parser.worker';
import { IRGenerator } from '../ir.worker';

describe('IR Generator', () => {
  it('should generate basic IR instructions for variable declarations', () => {
    const { tokens } = lex('int x = 42;');
    const { ast } = new Parser(tokens).parse();
    
    const generator = new IRGenerator(ast);
    const { ir, errors } = generator.generate();

    expect(errors).toHaveLength(0);
    expect(ir.entryBlockId).toBeDefined();

    const entryBlock = ir.blocks[ir.entryBlockId];
    expect(entryBlock).toBeDefined();
    expect(entryBlock.instructionIds.length).toBeGreaterThan(0);

    const instructions = Object.values(ir.instructions);
    
    // We expect a LOAD_CONST for 42 and a STORE to x
    const loadConst = instructions.find(inst => inst.opcode === 'LOAD_CONST');
    const store = instructions.find(inst => inst.opcode === 'STORE');

    expect(loadConst).toBeDefined();
    expect(loadConst?.operands).toContain('42');
    
    expect(store).toBeDefined();
    expect(store?.result).toBe('x');
  });

  it('should generate binary expressions in IR', () => {
    const { tokens } = lex('int x = 5 + 3;');
    const { ast } = new Parser(tokens).parse();
    
    const generator = new IRGenerator(ast);
    const { ir } = generator.generate();

    const instructions = Object.values(ir.instructions);
    
    // Should have ADD opcode
    const addInst = instructions.find(inst => inst.opcode === 'ADD');
    expect(addInst).toBeDefined();
    
    // Operand results should feed into STORE
    const storeInst = instructions.find(inst => inst.opcode === 'STORE');
    expect(storeInst).toBeDefined();
    expect(storeInst?.result).toBe('x');
  });

  it('should generate labels and jumps for conditional structures', () => {
    const code = `
      void main() {
        int x = 5;
        if (x) {
          x = 10;
        } else {
          x = 20;
        }
      }
    `;
    const { tokens } = lex(code);
    const { ast } = new Parser(tokens).parse();
    
    const generator = new IRGenerator(ast);
    const { ir } = generator.generate();

    const instructions = Object.values(ir.instructions);
    
    // Check if we have JUMP or JUMP_IF_FALSE (or similar) instructions
    const branchInst = instructions.find(inst => inst.opcode === 'JUMPIFNOT' || inst.opcode === 'JUMP');
    expect(branchInst).toBeDefined();

    // Check basic blocks
    const blocks = Object.values(ir.blocks);
    expect(blocks.length).toBeGreaterThan(2); // entry, then, else, endif
  });
});
