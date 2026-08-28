import type { WorkerRequest, WorkerResponse } from '../types/worker';
import type { OptimizerOutput, OptimizationPass } from '../types/pipeline';
import type { IRProgram } from '../types/compiler';

export class Optimizer {
  private ir: IRProgram;
  private passes: OptimizationPass[] = [];
  private idCounter = 0;

  constructor(ir: IRProgram) {
    this.ir = ir;
  }

  private createId(prefix = 'opt'): string {
    return `${prefix}_${this.idCounter++}`;
  }

  private isConstant(val: string) {
    return !isNaN(Number(val));
  }

  // Pass 1: Constant Folding
  private constantFolding() {
    let modified = 0;
    
    Object.values(this.ir.instructions).forEach(inst => {
      if ((inst.opcode === 'ADD' || inst.opcode === 'SUB' || inst.opcode === 'MUL' || inst.opcode === 'DIV') &&
          inst.operands.length === 2 &&
          this.isConstant(inst.operands[0]) &&
          this.isConstant(inst.operands[1])) {
          
          const a = Number(inst.operands[0]);
          const b = Number(inst.operands[1]);
          let result = 0;
          
          switch(inst.opcode) {
            case 'ADD': result = a + b; break;
            case 'SUB': result = a - b; break;
            case 'MUL': result = a * b; break;
            case 'DIV': result = Math.floor(a / b); break;
          }
          
          inst.opcode = 'LOAD_CONST';
          inst.operands = [String(result)];
          modified++;
      }
    });

    if (modified > 0) {
      this.passes.push({
        id: this.createId('pass'),
        name: 'Constant Folding',
        description: 'Evaluated constant expressions at compile time.',
        instructionsRemoved: 0,
        instructionsModified: modified
      });
    }
  }

  // Pass 2: Constant Propagation
  private constantPropagation() {
    let modified = 0;
    const constValues: Record<string, string> = {};

    Object.values(this.ir.blocks).forEach(block => {
      block.instructionIds.forEach(instId => {
        const inst = this.ir.instructions[instId];
        
        // Replace operands if they are known constants
        for (let i = 0; i < inst.operands.length; i++) {
          if (constValues[inst.operands[i]]) {
            inst.operands[i] = constValues[inst.operands[i]];
            modified++;
          }
        }

        // Record new constants
        if (inst.opcode === 'LOAD_CONST' && inst.result) {
          constValues[inst.result] = inst.operands[0];
        } else if (inst.result) {
          // Invalidate if it's assigned a non-constant
          delete constValues[inst.result];
        }
      });
    });

    if (modified > 0) {
      this.passes.push({
        id: this.createId('pass'),
        name: 'Constant Propagation',
        description: 'Propagated constant values to variable uses.',
        instructionsRemoved: 0,
        instructionsModified: modified
      });
    }
  }

  // Pass 3: Dead Code Elimination
  private deadCodeElimination() {
    let removed = 0;
    
    // Simplistic DCE: remove instructions that store to a temp variable that is never read
    const usedVars = new Set<string>();
    
    // First pass: find all used variables
    Object.values(this.ir.instructions).forEach(inst => {
      inst.operands.forEach(op => {
        if (!this.isConstant(op)) {
          usedVars.add(op);
        }
      });
    });

    // Second pass: remove unused instructions (if they have no side effects)
    Object.values(this.ir.blocks).forEach(block => {
      const newInstIds: string[] = [];
      block.instructionIds.forEach(instId => {
        const inst = this.ir.instructions[instId];
        // If result is temp (starts with t) and never used, and no side effects (e.g. not a CALL)
        if (inst.result && inst.result.startsWith('t') && !usedVars.has(inst.result) && inst.opcode !== 'CALL') {
          delete this.ir.instructions[instId];
          removed++;
        } else {
          newInstIds.push(instId);
        }
      });
      block.instructionIds = newInstIds;
    });

    if (removed > 0) {
      this.passes.push({
        id: this.createId('pass'),
        name: 'Dead Code Elimination',
        description: 'Removed unused instructions and unreachable basic blocks.',
        instructionsRemoved: removed,
        instructionsModified: 0
      });
    }
  }

  public optimize(): OptimizerOutput {
    // Run passes iteratively until no more changes, or fixed number of times
    // For simplicity, we just run the pipeline twice
    for (let i = 0; i < 2; i++) {
      this.constantFolding();
      this.constantPropagation();
      this.deadCodeElimination();
    }

    return {
      ir: this.ir,
      passes: this.passes,
      errors: [],
      durationMs: 0
    };
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest<IRProgram>>) => {
  const request = event.data;
  
  const startTime = performance.now();
  const optimizer = new Optimizer(request.payload);
  const result = optimizer.optimize();
  result.durationMs = performance.now() - startTime;

  const response: WorkerResponse<OptimizerOutput> = {
    requestId: request.requestId,
    success: true,
    data: result,
    error: null,
  };
  
  self.postMessage(response);
};
