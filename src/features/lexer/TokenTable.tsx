import { useRef, useState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useCompilerStore } from '@/store/compilerStore'
import { useEditorStore } from '@/store/editorStore'
import { useUIStore } from '@/store/uiStore'
import { StageErrorFallback } from '@/components/StageErrorFallback'

const TOKEN_COLORS: Record<string, string> = {
  keyword: 'text-[#C084FC]', // matching monaco theme accent
  identifier: 'text-text-primary',
  number: 'text-[#1F6FEB]', // info color
  string: 'text-[#238636]', // success color
  operator: 'text-warning',
  delimiter: 'text-text-muted',
  comment: 'text-[#6E7681]', // muted, italic
  whitespace: 'text-text-muted opacity-50',
  unknown: 'text-error font-bold',
}

const TOKEN_GLOSSARY: Record<string, string> = {
  keyword: 'A reserved word in C with special meaning (e.g. int, if, return).',
  identifier: 'A name you created (e.g. variable or function names).',
  number: 'A literal numeric value (e.g. 10, 20).',
  string: 'A text literal value enclosed in quotes.',
  operator: 'An arithmetic or assignment symbol (e.g. +, =).',
  delimiter: 'A syntax separator (e.g. ;, {, }, (, )).',
  comment: 'Developer notes ignored by the compiler.',
  whitespace: 'Spaces, tabs, and newlines used for readability.',
  unknown: 'An invalid character sequence causing a lexer error.',
}

export function TokenTable() {
  const tokens = useCompilerStore((state) => state.tokens) || []
  const setHighlightedLine = useEditorStore((state) => state.setHighlightedLine)
  const mode = useUIStore((state) => state.mode)
  const [showWhitespace, setShowWhitespace] = useState(false)

  // In beginner mode, always hide whitespaces and comments to keep it simple
  const isBeginner = mode === 'beginner'
  const displayTokens = isBeginner
    ? tokens.filter((t) => t.type !== 'whitespace' && t.type !== 'comment')
    : showWhitespace
      ? tokens
      : tokens.filter((t) => t.type !== 'whitespace')

  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: displayTokens.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // 36px row height
    overscan: 5,
  })

  if (!tokens || tokens.length === 0) {
    return (
      <StageErrorFallback
        stage="lexer"
        title="No Tokens Available"
        description="Compile your C code to see the Lexer output."
      />
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary font-mono text-sm">
      {/* Educational Banner for Beginner Mode */}
      {isBeginner && (
        <div className="p-4 bg-bg-tertiary border-b border-border-primary text-xs leading-relaxed text-text-secondary">
          <h3 className="font-bold text-info mb-1 uppercase tracking-wider text-[10px]">
            What is Lexical Analysis?
          </h3>
          <p>
            The <strong>Lexer</strong> scans your C source code
            character-by-character and groups them into meaningful chunks called{' '}
            <strong>Tokens</strong> (like words in a sentence). It classifies
            each token (e.g., keywords, variable names, numbers) and filters out
            formatting spaces and comments.
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary text-xs text-text-secondary font-bold tracking-wider shrink-0 justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <div className="w-12">ID</div>
          <div className="w-28">TYPE</div>
          <div className="flex-1">VALUE</div>
          <div className="w-16 text-right">POS</div>
        </div>
        {!isBeginner && (
          <div className="ml-4">
            <label className="flex items-center space-x-2 cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
              <input
                type="checkbox"
                checked={showWhitespace}
                onChange={(e) => setShowWhitespace(e.target.checked)}
                className="accent-info w-3 h-3"
              />
              <span className="text-[10px] uppercase">Whitespace</span>
            </label>
          </div>
        )}
      </div>

      {/* Virtualized Table Body */}
      <div ref={parentRef} className="flex-1 overflow-auto bg-bg-primary p-2">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const token = displayTokens[virtualRow.index]
            const isNewline = token.value.includes('\n')
            const displayValue = isNewline
              ? token.value.replace(/\n/g, '\\n')
              : token.value

            return (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center px-2 hover:bg-bg-secondary transition-colors cursor-pointer border-b border-border-primary/30"
                onMouseEnter={() => setHighlightedLine(token.range.start.line)}
                onMouseLeave={() => setHighlightedLine(null)}
                title={
                  isBeginner
                    ? `${TOKEN_GLOSSARY[token.type] || ''} (Line ${token.range.start.line}:${token.range.start.column})`
                    : `Length: ${token.length}, Offset: ${token.range.start.offset}`
                }
              >
                <div
                  className="w-12 text-xs text-text-muted truncate pr-2"
                  title={token.id}
                >
                  {token.id.slice(0, 4)}
                </div>
                <div className="w-28 text-[10px] uppercase tracking-wide">
                  <span
                    className={`px-1.5 py-0.5 rounded-sm bg-bg-secondary border border-border-primary/50 ${TOKEN_COLORS[token.type] || 'text-text-primary'}`}
                  >
                    {token.type}
                  </span>
                </div>
                <div
                  className={`flex-1 truncate pr-4 ${TOKEN_COLORS[token.type] || 'text-text-primary'} ${token.type === 'comment' ? 'italic' : ''}`}
                >
                  {displayValue}
                </div>
                <div className="w-16 text-right text-xs text-text-muted">
                  {token.range.start.line}:{token.range.start.column}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
