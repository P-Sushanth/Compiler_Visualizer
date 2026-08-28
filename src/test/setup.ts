import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';
import { lex } from '../workers/lexer.worker';
import { Parser } from '../workers/parser.worker';
import { SemanticAnalyzer } from '../workers/semantic.worker';
import { IRGenerator } from '../workers/ir.worker';
import { Optimizer } from '../workers/optimizer.worker';
import { AssemblyGenerator } from '../workers/assembly.worker';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => {
  return {
    default: function MockMonacoEditor({ value, onChange }: any) {
      return React.createElement('textarea', {
        'data-testid': 'monaco-editor',
        value: value || '',
        onChange: (e: any) => onChange?.(e.target.value),
      });
    },
  };
});

// Mock ResizeObserver
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = MockResizeObserver;

// Mock Web Worker to run actual compiler stages in tests
class MockWorker {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  constructor(stringUrl: string | URL, options?: any) {
    this.url = String(stringUrl);
  }

  postMessage(message: any) {
    setTimeout(() => {
      try {
        let result: any = null;
        if (this.url.includes('lexer.worker')) {
          result = lex(message.payload);
        } else if (this.url.includes('parser.worker')) {
          const parser = new Parser(message.payload);
          result = parser.parse();
        } else if (this.url.includes('semantic.worker')) {
          const analyzer = new SemanticAnalyzer(message.payload);
          result = analyzer.analyze();
        } else if (this.url.includes('ir.worker')) {
          const generator = new IRGenerator(message.payload);
          result = generator.generate();
        } else if (this.url.includes('optimizer.worker')) {
          const optimizer = new Optimizer(message.payload);
          result = optimizer.optimize();
        } else if (this.url.includes('assembly.worker')) {
          const generator = new AssemblyGenerator(message.payload);
          result = generator.generate();
        } else {
          // Fallback empty result
          result = {};
        }

        if (this.onmessage) {
          this.onmessage({
            data: {
              requestId: message.requestId,
              success: true,
              data: result,
              error: null,
            },
          } as MessageEvent);
        }
      } catch (err: any) {
        if (this.onmessage) {
          this.onmessage({
            data: {
              requestId: message.requestId,
              success: false,
              data: null,
              error: err.message || 'Worker error',
            },
          } as MessageEvent);
        }
      }
    }, 0);
  }

  terminate() {}
}

global.Worker = MockWorker as any;
