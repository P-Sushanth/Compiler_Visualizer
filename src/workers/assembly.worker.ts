import type { WorkerRequest, WorkerResponse } from '../types/worker';
import type { AssemblyOutput, AssemblyInstruction } from '../types/pipeline';
import type { IRProgram } from '../types/compiler';

class AssemblyGenerator {
  private ir: IRProgram;
  private instructions: AssemblyInstruction[] = [];
  
  // Basic register allocation state
  private regMap: Record<string, string> = {};
  private availableRegs = ['eax', 'ebx', 'ecx', 'edx', 'esi', 'edi'];
  private regIndex = 0;

  private idCounter = 0;

  constructor(ir: IRProgram) {
    this.ir = ir;
  }

  private createId(prefix = 'asm'): string {
    return `${prefix}_${this.idCounter++}`;
  }

  private emit(op: string, args: string[] = [], comment?: string, sourceNodeId?: string | null) {
    this.instructions.push({
      id: this.createId(),
      op,
      args,
      comment,
      sourceNodeId
    });
  }

  private getRegister(temp: string): string {
    if (!this.regMap[temp]) {
      this.regMap[temp] = this.availableRegs[this.regIndex % this.availableRegs.length];
      this.regIndex++;
    }
    return '%' + this.regMap[temp];
  }

  private isConstant(val: string) {
    return !isNaN(Number(val));
  }

  private getOperand(op: string): string {
    if (this.isConstant(op)) return '$' + op;
    return this.getRegister(op);
  }

  public generate(): AssemblyOutput {
    if (!this.ir || !this.ir.blocks) {
      return { instructions: [], errors: [], durationMs: 0 };
    }

    this.emit('.text', [], 'Text section');
    this.emit('.global main', [], 'Export main symbol');

    // We generate code block by block
    Object.values(this.ir.blocks).forEach(block => {
      this.emit(block.label + ':', [], 'Basic Block');
      
      block.instructionIds.forEach(instId => {
        const inst = this.ir.instructions[instId];
        if (!inst) return;
        
        const srcNode = inst.sourceNodeId;

        switch (inst.opcode) {
          case 'LOAD_CONST':
            this.emit('movl', [this.getOperand(inst.operands[0]), this.getRegister(inst.result!)], 'Load constant', srcNode);
            break;
            
          case 'STORE':
            this.emit('movl', [this.getOperand(inst.operands[0]), this.getRegister(inst.result!)], 'Store value', srcNode);
            break;
            
          case 'LOAD':
            this.emit('movl', [this.getRegister(inst.operands[0]), this.getRegister(inst.result!)], 'Load value', srcNode);
            break;

          case 'ADD':
            this.emit('movl', [this.getOperand(inst.operands[0]), '%eax'], 'Load left operand', srcNode);
            this.emit('addl', [this.getOperand(inst.operands[1]), '%eax'], 'Add right operand', srcNode);
            this.emit('movl', ['%eax', this.getRegister(inst.result!)], 'Store result', srcNode);
            break;

          case 'SUB':
            this.emit('movl', [this.getOperand(inst.operands[0]), '%eax'], 'Load left operand', srcNode);
            this.emit('subl', [this.getOperand(inst.operands[1]), '%eax'], 'Sub right operand', srcNode);
            this.emit('movl', ['%eax', this.getRegister(inst.result!)], 'Store result', srcNode);
            break;
            
          case 'MUL':
            this.emit('movl', [this.getOperand(inst.operands[0]), '%eax'], 'Load left operand', srcNode);
            this.emit('imull', [this.getOperand(inst.operands[1]), '%eax'], 'Multiply right operand', srcNode);
            this.emit('movl', ['%eax', this.getRegister(inst.result!)], 'Store result', srcNode);
            break;
            
          case 'DIV':
            this.emit('movl', [this.getOperand(inst.operands[0]), '%eax'], 'Load left operand', srcNode);
            this.emit('cdq', [], 'Sign extend EAX into EDX', srcNode);
            this.emit('idivl', [this.getOperand(inst.operands[1])], 'Divide', srcNode);
            this.emit('movl', ['%eax', this.getRegister(inst.result!)], 'Store result', srcNode);
            break;

          case 'EQ':
          case 'NEQ':
          case 'LT':
          case 'GT':
          case 'LTE':
          case 'GTE':
            this.emit('movl', [this.getOperand(inst.operands[0]), '%eax'], 'Load left operand', srcNode);
            this.emit('cmpl', [this.getOperand(inst.operands[1]), '%eax'], 'Compare operands', srcNode);
            
            let setOp = 'sete';
            if (inst.opcode === 'NEQ') setOp = 'setne';
            if (inst.opcode === 'LT') setOp = 'setl';
            if (inst.opcode === 'GT') setOp = 'setg';
            if (inst.opcode === 'LTE') setOp = 'setle';
            if (inst.opcode === 'GTE') setOp = 'setge';
            
            this.emit(setOp, ['%al'], 'Set result flag', srcNode);
            this.emit('movzbl', ['%al', this.getRegister(inst.result!)], 'Zero extend to 32bit', srcNode);
            break;

          case 'JUMP':
            this.emit('jmp', [inst.operands[0]], 'Unconditional jump', srcNode);
            break;

          case 'JUMPIFNOT':
            this.emit('cmpl', ['$0', this.getOperand(inst.operands[0])], 'Check if false', srcNode);
            this.emit('je', [inst.operands[1]], 'Jump if zero/false', srcNode);
            break;

          case 'CALL':
            // Save registers, setup stack (simplified)
            this.emit('call', [inst.operands[0]], 'Call function', srcNode);
            if (inst.result) {
              this.emit('movl', ['%eax', this.getRegister(inst.result)], 'Store return value', srcNode);
            }
            break;

          case 'RET':
            if (inst.operands.length > 0) {
              this.emit('movl', [this.getOperand(inst.operands[0]), '%eax'], 'Set return value', srcNode);
            }
            this.emit('ret', [], 'Return', srcNode);
            break;

          case 'LABEL':
            this.emit(inst.operands[0] + ':', [], 'Function Entry', srcNode);
            break;
            
          case 'ALLOC':
            // Pseudo instruction, normally handled by stack pointer subtraction
            this.emit('# alloc', [inst.result!], 'Stack allocation reserved', srcNode);
            break;
            
          default:
            this.emit('# Unknown opcode', [inst.opcode], 'Warning', srcNode);
        }
      });
      this.emit('', []); // Empty line for readability
    });

    return {
      instructions: this.instructions,
      errors: [],
      durationMs: 0
    };
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest<IRProgram>>) => {
  const request = event.data;
  
  const startTime = performance.now();
  const generator = new AssemblyGenerator(request.payload);
  const result = generator.generate();
  result.durationMs = performance.now() - startTime;

  const response: WorkerResponse<AssemblyOutput> = {
    requestId: request.requestId,
    success: true,
    data: result,
    error: null,
  };
  
  self.postMessage(response);
};
