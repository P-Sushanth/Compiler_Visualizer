import { WorkerManager } from './WorkerManager';
import type { Token, AST } from '@/types/compiler';
import type { LexerOutput, ParserOutput, SemanticOutput, IROutput, OptimizerOutput, AssemblyOutput } from '@/types/pipeline';
import { useCompilerStore } from '@/store/compilerStore';
import { useEditorStore } from '@/store/editorStore';

class PipelineOrchestrator {
  private lexerWorker: WorkerManager<string, LexerOutput>;
  private parserWorker: WorkerManager<Token[], ParserOutput>;
  private semanticWorker: WorkerManager<AST, SemanticOutput>;
  private irWorker: WorkerManager<AST, IROutput>;
  private optimizerWorker: WorkerManager<import('@/types/compiler').IRProgram, OptimizerOutput>;
  private assemblyWorker: WorkerManager<import('@/types/compiler').IRProgram, AssemblyOutput>;
  
  private abortController: AbortController | null = null;

  constructor() {
    this.lexerWorker = new WorkerManager(
      () => new Worker(new URL('../workers/lexer.worker.ts', import.meta.url), { type: 'module' })
    );
    this.parserWorker = new WorkerManager(
      () => new Worker(new URL('../workers/parser.worker.ts', import.meta.url), { type: 'module' })
    );
    this.semanticWorker = new WorkerManager(
      () => new Worker(new URL('../workers/semantic.worker.ts', import.meta.url), { type: 'module' })
    );
    this.irWorker = new WorkerManager(
      () => new Worker(new URL('../workers/ir.worker.ts', import.meta.url), { type: 'module' })
    );
    this.optimizerWorker = new WorkerManager(
      () => new Worker(new URL('../workers/optimizer.worker.ts', import.meta.url), { type: 'module' })
    );
    this.assemblyWorker = new WorkerManager(
      () => new Worker(new URL('../workers/assembly.worker.ts', import.meta.url), { type: 'module' })
    );
  }

  public async compile(sourceCode: string) {
    // Cancellation of previous run
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    const compilerStore = useCompilerStore.getState();
    const editorStore = useEditorStore.getState();
    
    compilerStore.setCompileStart();
    editorStore.setErrorDecorations([]);
    
    const startTime = performance.now();
    const stageMetrics: Record<string, number | null> = {
      lexer: null,
      parser: null,
      semantic: null,
      ir: null,
      optimizer: null,
      assembly: null,
    };

    try {
      // 1. Lexical Analysis
      if (signal.aborted) throw new Error('Cancelled');
      const lexerResult = await this.lexerWorker.execute(sourceCode);
      if (lexerResult.errors.length > 0) {
        this.handleErrors(lexerResult.errors);
        return;
      }
      stageMetrics.lexer = lexerResult.durationMs;

      // 2. Syntax Analysis (Parsing)
      if (signal.aborted) throw new Error('Cancelled');
      const tokensForParser = lexerResult.tokens.filter(
        t => t.type !== 'whitespace' && t.type !== 'comment'
      );
      const parserResult = await this.parserWorker.execute(tokensForParser);
      if (parserResult.errors.length > 0) {
        this.handleErrors(parserResult.errors);
        return;
      }
      stageMetrics.parser = parserResult.durationMs;

      // 3. Semantic Analysis
      if (signal.aborted) throw new Error('Cancelled');
      const semanticResult = await this.semanticWorker.execute(parserResult.ast);
      if (semanticResult.errors.length > 0) {
        this.handleErrors(semanticResult.errors);
        return;
      }
      stageMetrics.semantic = semanticResult.durationMs;

      // 4. Intermediate Representation (IR)
      if (signal.aborted) throw new Error('Cancelled');
      const irResult = await this.irWorker.execute(parserResult.ast);
      if (irResult.errors.length > 0) {
        this.handleErrors(irResult.errors);
        return;
      }
      stageMetrics.ir = irResult.durationMs;

      // 5. Optimization
      if (signal.aborted) throw new Error('Cancelled');
      const optimizerResult = await this.optimizerWorker.execute(irResult.ir);
      if (optimizerResult.errors.length > 0) {
        this.handleErrors(optimizerResult.errors);
        return;
      }
      stageMetrics.optimizer = optimizerResult.durationMs;

      // 6. Assembly Generation
      if (signal.aborted) throw new Error('Cancelled');
      const assemblyResult = await this.assemblyWorker.execute(optimizerResult.ir);
      if (assemblyResult.errors.length > 0) {
        this.handleErrors(assemblyResult.errors);
        return;
      }
      stageMetrics.assembly = assemblyResult.durationMs;

      // Pipeline complete
      if (signal.aborted) throw new Error('Cancelled');
      compilerStore.setCompileSuccess({
        tokens: lexerResult.tokens,
        ast: parserResult.ast,
        semanticModel: semanticResult.semanticModel,
        ir: irResult.ir,
        optimizedIR: optimizerResult.ir,
        optimizationPasses: optimizerResult.passes,
        assembly: assemblyResult.instructions,
        stageMetrics,
        lastCompileDurationMs: performance.now() - startTime,
      });

    } catch (error: any) {
      if (error.message === 'Cancelled') {
        // Just cancelled by a new compilation, ignore
      } else {
        console.error('Compiler pipeline failed:', error);
        compilerStore.setStatus('error');
      }
    }
  }

  private handleErrors(errors: any[]) {
    const compilerStore = useCompilerStore.getState();
    const editorStore = useEditorStore.getState();
    
    compilerStore.setCompileError(errors);
    
    // Map diagnostics to editor decorations
    const decorations = errors.map(err => ({
      line: err.range?.start.line || 1,
      message: err.message
    }));
    editorStore.setErrorDecorations(decorations);
  }
}

export const pipeline = new PipelineOrchestrator();
