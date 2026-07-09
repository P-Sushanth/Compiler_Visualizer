import { create } from 'zustand';

type EditorState = {
  sourceCode: string;
  setSourceCode: (code: string) => void;
  errorDecorations: Array<{ line: number; message: string }>;
  setErrorDecorations: (decorations: Array<{ line: number; message: string }>) => void;
  highlightedLine: number | null;
  setHighlightedLine: (line: number | null) => void;
};

export const CODE_EXAMPLES = {
  'basic': `int main() {
    int x = 10;
    int y = 20;
    return x + y;
}`,
  'fibonacci': `int fib(int n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

int main() {
    return fib(5);
}`,
  'loop': `int main() {
    int sum = 0;
    for (int i = 0; i < 10; i = i + 1) {
        sum = sum + i;
    }
    return sum;
}`
};

export const useEditorStore = create<EditorState>((set) => ({
  sourceCode: CODE_EXAMPLES.basic,
  setSourceCode: (code) => set({ sourceCode: code }),
  errorDecorations: [],
  setErrorDecorations: (decorations) => set({ errorDecorations: decorations }),
  highlightedLine: null,
  setHighlightedLine: (line) => set({ highlightedLine: line }),
}));
