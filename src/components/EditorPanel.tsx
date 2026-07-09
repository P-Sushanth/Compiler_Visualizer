import { useCallback, useEffect, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { useEditorStore, CODE_EXAMPLES } from '@/store/editorStore';
import { useDebounce } from '@/hooks/useDebounce';
import { pipeline } from '@/services/PipelineOrchestrator';

import { memo } from 'react';

export const EditorPanel = memo(function EditorPanel() {
  const { 
    sourceCode, 
    setSourceCode,
    errorDecorations,
    highlightedLine
  } = useEditorStore();
  
  const monaco = useMonaco();
  const editorRef = useRef<any>(null);
  const decorationsCollection = useRef<any>(null);

  // Debounced compile logic
  const debouncedCode = useDebounce(sourceCode, 600);

  useEffect(() => {
    if (debouncedCode) {
      pipeline.compile(debouncedCode);
    }
  }, [debouncedCode]);

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('neo-brutalist', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6E7681', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'aa3bff', fontStyle: 'bold' },
          { token: 'string', foreground: '238636' },
          { token: 'number', foreground: '1F6FEB' },
          { token: 'type', foreground: 'D29922' },
        ],
        colors: {
          'editor.background': '#1D2330',
          'editor.foreground': '#E6EDF3',
          'editorLineNumber.foreground': '#6E7681',
          'editorCursor.foreground': '#E6EDF3',
          'editor.selectionBackground': '#394355',
          'editor.inactiveSelectionBackground': '#2A3140',
          'editor.lineHighlightBackground': '#161A22',
          'editorError.foreground': '#DA3633',
        },
      });
      monaco.editor.setTheme('neo-brutalist');
    }
  }, [monaco]);

  // Apply decorations (Errors and Highlights)
  useEffect(() => {
    if (!editorRef.current || !monaco) return;

    if (!decorationsCollection.current) {
      decorationsCollection.current = editorRef.current.createDecorationsCollection();
    }

    const decorations: any[] = [];

    // Add Error Decorations
    errorDecorations.forEach((err) => {
      decorations.push({
        range: new monaco.Range(err.line, 1, err.line, 1),
        options: {
          isWholeLine: true,
          className: 'bg-error bg-opacity-20',
          glyphMarginClassName: 'bg-error',
          hoverMessage: { value: err.message }
        }
      });
    });

    // Add Line Highlighting (e.g. for step-by-step visualization)
    if (highlightedLine !== null) {
      decorations.push({
        range: new monaco.Range(highlightedLine, 1, highlightedLine, 1),
        options: {
          isWholeLine: true,
          className: 'bg-info bg-opacity-20 border-l-4 border-info'
        }
      });
    }

    decorationsCollection.current.set(decorations);
  }, [errorDecorations, highlightedLine, monaco]);

  const handleEditorMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor;

    // Add Ctrl+Enter / Cmd+Enter shortcut
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.Enter, () => {
      pipeline.compile(editor.getValue());
    });
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined) {
        setSourceCode(value);
      }
    },
    [setSourceCode]
  );

  return (
    <section className="flex-1 bg-bg-primary flex flex-col min-w-0 h-full">
      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary shrink-0 justify-between">
        <div className="flex items-center space-x-4">
          <span className="text-xs font-mono text-text-secondary">main.c</span>
          <select 
            className="bg-bg-tertiary text-text-primary text-xs px-2 py-1 rounded border border-border-primary outline-none focus:border-info cursor-pointer"
            onChange={(e) => {
              const ex = e.target.value as keyof typeof CODE_EXAMPLES;
              setSourceCode(CODE_EXAMPLES[ex]);
            }}
          >
            <option value="basic">Basic Math</option>
            <option value="fibonacci">Fibonacci</option>
            <option value="loop">For Loop</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <select className="bg-bg-tertiary text-text-muted text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-border-primary outline-none cursor-pointer">
            <option value="c99">C99</option>
            <option value="c89">C89</option>
            <option value="c11">C11</option>
          </select>
        </div>
      </div>
      <div className="flex-1 w-full bg-bg-tertiary overflow-hidden relative">
        <Editor
          height="100%"
          width="100%"
          language="c"
          theme="neo-brutalist"
          value={sourceCode}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: '"JetBrains Mono", Consolas, monospace',
            fontLigatures: true,
            lineHeight: 24,
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            formatOnPaste: true,
            renderLineHighlight: 'all',
            glyphMargin: true,
          }}
          loading={
            <div className="flex h-full w-full items-center justify-center text-text-muted font-mono text-sm">
              Initializing Editor...
            </div>
          }
        />
      </div>
    </section>
  );
});
