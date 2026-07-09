import type { WorkerRequest, WorkerResponse } from '../types/worker';
import type { IROutput } from '../types/pipeline';
import type { 
  AST, 
  ASTNode, 
  BasicBlock, 
  IRInstruction,
  CompilerDiagnostic
} from '../types/compiler';

class IRGenerator {
  private ast: AST;
  private blocks: Record<string, BasicBlock> = {};
  private instructions: Record<string, IRInstruction> = {};
  private errors: CompilerDiagnostic[] = [];

  private currentBlockId: string | null = null;
  private entryBlockId: string | null = null;

  private tempCounter = 0;
  private labelCounter = 0;

  constructor(ast: AST) {
    this.ast = ast;
  }

  private createId(): string {
    return crypto.randomUUID();
  }

  private newTemp(): string {
    return 't' + (this.tempCounter++);
  }

  private newBlock(labelPrefix = 'L'): string {
    const id = this.createId();
    const label = '.' + labelPrefix + (this.labelCounter++);
    this.blocks[id] = {
      id,
      label,
      instructionIds: [],
      successorBlockIds: []
    };
    return id;
  }

  private emit(opcode: string, operands: string[], result: string | null, sourceNodeId: string | null): string {
    if (!this.currentBlockId) return '';
    const id = this.createId();
    const instruction: IRInstruction = {
      id,
      opcode,
      operands,
      result,
      blockId: this.currentBlockId,
      sourceNodeId
    };
    this.instructions[id] = instruction;
    this.blocks[this.currentBlockId].instructionIds.push(id);
    return id;
  }

  private linkBlocks(fromId: string, toId: string) {
    if (fromId && toId) {
      this.blocks[fromId].successorBlockIds.push(toId);
    }
  }

  public generate(): IROutput {
    if (!this.ast || !this.ast.rootId) {
      return {
        ir: { blocks: {}, instructions: {}, entryBlockId: '' },
        errors: [],
        durationMs: 0
      };
    }

    const entryId = this.newBlock('entry');
    this.entryBlockId = entryId;
    this.currentBlockId = entryId;

    this.visit(this.ast.nodes[this.ast.rootId]);

    // Ensure entryBlockId is definitely a string
    return {
      ir: {
        blocks: this.blocks,
        instructions: this.instructions,
        entryBlockId: this.entryBlockId || ''
      },
      errors: this.errors,
      durationMs: 0
    };
  }

  private visit(node: ASTNode): string | null {
    if (!node) return null;

    switch (node.type) {
      case 'Program':
      case 'BlockStatement': {
        const blockNode = node as any;
        for (const childId of blockNode.body) {
          this.visit(this.ast.nodes[childId]);
        }
        return null;
      }

      case 'FunctionDeclaration': {
        const fnNode = node as any;
        // In a real compiler, each function gets its own IR context. We'll simplify and append it to global stream.
        this.emit('LABEL', [fnNode.identifier], null, fnNode.id);
        this.visit(this.ast.nodes[fnNode.body]);
        return null;
      }

      case 'VariableDeclaration': {
        const varNode = node as any;
        if (varNode.value) {
          const valTemp = this.visit(this.ast.nodes[varNode.value]);
          if (valTemp) {
            this.emit('STORE', [valTemp], varNode.identifier, varNode.id);
          }
        } else {
          this.emit('ALLOC', [varNode.varType || 'int'], varNode.identifier, varNode.id);
        }
        return varNode.identifier;
      }

      case 'IfStatement': {
        const ifNode = node as any;
        const condTemp = this.visit(this.ast.nodes[ifNode.test]);

        const thenBlock = this.newBlock('then');
        const elseBlock = ifNode.alternate ? this.newBlock('else') : null;
        const endBlock = this.newBlock('endif');

        const fallthroughBlock = elseBlock || endBlock;

        this.emit('JUMPIFNOT', condTemp ? [condTemp, this.blocks[fallthroughBlock].label] : [], null, ifNode.id);
        
        const currentIfBlock = this.currentBlockId;
        if (currentIfBlock) {
            this.linkBlocks(currentIfBlock, thenBlock);
            if (elseBlock) this.linkBlocks(currentIfBlock, elseBlock);
            else this.linkBlocks(currentIfBlock, endBlock);
        }

        // Then block
        this.currentBlockId = thenBlock;
        this.visit(this.ast.nodes[ifNode.consequent]);
        this.emit('JUMP', [this.blocks[endBlock].label], null, null);
        this.linkBlocks(thenBlock, endBlock);

        // Else block
        if (elseBlock && ifNode.alternate) {
          this.currentBlockId = elseBlock;
          this.visit(this.ast.nodes[ifNode.alternate]);
          this.emit('JUMP', [this.blocks[endBlock].label], null, null);
          this.linkBlocks(elseBlock, endBlock);
        }

        this.currentBlockId = endBlock;
        return null;
      }

      case 'ForStatement': {
        const forNode = node as any;
        
        // Init
        if (forNode.init) this.visit(this.ast.nodes[forNode.init]);

        const condBlock = this.newBlock('for_cond');
        const bodyBlock = this.newBlock('for_body');
        const endBlock = this.newBlock('for_end');

        // Jump to condition
        this.emit('JUMP', [this.blocks[condBlock].label], null, null);
        if (this.currentBlockId) this.linkBlocks(this.currentBlockId, condBlock);

        // Condition
        this.currentBlockId = condBlock;
        if (forNode.test) {
          const condTemp = this.visit(this.ast.nodes[forNode.test]);
          this.emit('JUMPIFNOT', condTemp ? [condTemp, this.blocks[endBlock].label] : [], null, forNode.id);
        }
        this.linkBlocks(condBlock, bodyBlock);
        this.linkBlocks(condBlock, endBlock);

        // Body
        this.currentBlockId = bodyBlock;
        this.visit(this.ast.nodes[forNode.body]);
        
        // Update
        if (forNode.update) this.visit(this.ast.nodes[forNode.update]);
        
        // Loop back
        this.emit('JUMP', [this.blocks[condBlock].label], null, null);
        this.linkBlocks(bodyBlock, condBlock);

        this.currentBlockId = endBlock;
        return null;
      }

      case 'ReturnStatement': {
        const retNode = node as any;
        let retVal = null;
        if (retNode.argument) {
          retVal = this.visit(this.ast.nodes[retNode.argument]);
        }
        this.emit('RET', retVal ? [retVal] : [], null, retNode.id);
        return null;
      }

      case 'ExpressionStatement': {
        const exprStmt = node as any;
        return this.visit(this.ast.nodes[exprStmt.expression]);
      }

      case 'BinaryExpression': {
        const binNode = node as any;
        const leftTemp = this.visit(this.ast.nodes[binNode.left]);
        const rightTemp = this.visit(this.ast.nodes[binNode.right]);
        
        // Map operator to opcode
        let opcode = 'OP';
        switch (binNode.operator) {
            case '+': opcode = 'ADD'; break;
            case '-': opcode = 'SUB'; break;
            case '*': opcode = 'MUL'; break;
            case '/': opcode = 'DIV'; break;
            case '%': opcode = 'MOD'; break;
            case '==': opcode = 'EQ'; break;
            case '!=': opcode = 'NEQ'; break;
            case '<': opcode = 'LT'; break;
            case '>': opcode = 'GT'; break;
            case '<=': opcode = 'LTE'; break;
            case '>=': opcode = 'GTE'; break;
            case '=': 
                // Assignment is special
                if (leftTemp && rightTemp) {
                    this.emit('STORE', [rightTemp], leftTemp, binNode.id);
                }
                return leftTemp;
        }

        const resultTemp = this.newTemp();
        if (leftTemp && rightTemp) {
            this.emit(opcode, [leftTemp, rightTemp], resultTemp, binNode.id);
        }
        return resultTemp;
      }

      case 'CallExpression': {
        const callNode = node as any;
        const argsTemps = [];
        for (const argId of callNode.arguments) {
          argsTemps.push(this.visit(this.ast.nodes[argId]));
        }
        const calleeNode = this.ast.nodes[callNode.callee] as any;
        const calleeName = calleeNode?.name || 'unknown_fn';
        
        const resultTemp = this.newTemp();
        this.emit('CALL', [calleeName, ...(argsTemps.filter(Boolean) as string[])], resultTemp, callNode.id);
        return resultTemp;
      }

      case 'Identifier': {
        const idNode = node as any;
        const resultTemp = this.newTemp();
        this.emit('LOAD', [idNode.name], resultTemp, idNode.id);
        return resultTemp;
      }
        
      case 'Literal': {
        const litNode = node as any;
        const resultTemp = this.newTemp();
        this.emit('LOAD_CONST', [String(litNode.value)], resultTemp, litNode.id);
        return resultTemp;
      }
    }
    
    return null;
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest<AST>>) => {
  const request = event.data;
  
  const startTime = performance.now();
  const generator = new IRGenerator(request.payload);
  const result = generator.generate();
  result.durationMs = performance.now() - startTime;

  const response: WorkerResponse<IROutput> = {
    requestId: request.requestId,
    success: true,
    data: result,
    error: null,
  };
  
  self.postMessage(response);
};
