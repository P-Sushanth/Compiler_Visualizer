import { useCompilerStore } from '@/store/compilerStore'
import { useEditorStore } from '@/store/editorStore'
import { useUIStore } from '@/store/uiStore'
import { StageErrorFallback } from '@/components/StageErrorFallback'

const ASM_GLOSSARY: Record<string, string> = {
  movl: 'Moves a 32-bit value from source to destination (e.g. movl $10, %eax).',
  addl: 'Adds source value to destination and stores result in destination.',
  subl: 'Subtracts source value from destination and stores result in destination.',
  imull:
    'Multiplies destination by source value and stores result in destination.',
  cltd: 'Sign-extends %eax register into %edx, preparing for division.',
  idivl:
    'Divides %edx:%eax by source value; quotient in %eax, remainder in %edx.',
  ret: 'Exits the current function and returns control to the caller.',
  cmpl: 'Compares two operands (e.g. cmpl $10, %ebx) and sets CPU status flags.',
  jle: 'Jump if Less than or Equal: branches to a label based on the last compare.',
  jge: 'Jump if Greater than or Equal: branches to a label based on the last compare.',
  jl: 'Jump if Less: branches to a label based on the last compare.',
  jg: 'Jump if Greater: branches to a label based on the last compare.',
  je: 'Jump if Equal: branches to a label based on the last compare.',
  jmp: 'Unconditional Jump: transfers control directly to a target label.',
  '.text': 'Declares the start of the code/instructions section.',
  '.global': 'Makes the specified function entry point visible to the linker.',
}

export function AssemblyViewer() {
  const assembly = useCompilerStore((state) => state.assembly)
  const ast = useCompilerStore((state) => state.ast)
  const setHighlightedLine = useEditorStore((state) => state.setHighlightedLine)
  const mode = useUIStore((state) => state.mode)
  const isBeginner = mode === 'beginner'

  if (!assembly || assembly.length === 0) {
    return (
      <StageErrorFallback
        stage="assembly"
        title="No Assembly Output"
        description="Compile your C code to view the generated pseudo-assembly."
      />
    )
  }

  const handleMouseEnter = (sourceNodeId?: string | null) => {
    if (!sourceNodeId || !ast) return
    const node = ast.nodes[sourceNodeId]
    if (node && node.range) {
      setHighlightedLine(node.range.start.line)
    }
  }

  const handleMouseLeave = () => {
    setHighlightedLine(null)
  }

  return (
    <div className="flex flex-col h-full w-full bg-bg-primary font-mono text-sm">
      {/* Educational Banner for Beginner Mode */}
      {isBeginner && (
        <div className="p-4 bg-bg-tertiary border-b border-border-primary text-xs leading-relaxed text-text-secondary shrink-0">
          <h3 className="font-bold text-info mb-1 uppercase tracking-wider text-[10px]">
            What is Assembly Generation & Register Allocation?
          </h3>
          <p>
            The <strong>Code Generator</strong> produces the final
            human-readable <strong>CPU Assembly Language</strong>. Crucially, it
            maps abstract temporary variables from intermediate representation
            (IR) to actual hardware storage slots called{' '}
            <strong>Registers</strong> (like <code>%eax</code>,{' '}
            <code>%ebx</code>) in a process called{' '}
            <strong>Register Allocation</strong>.
          </p>
        </div>
      )}

      <div className="flex items-center px-4 h-10 bg-bg-secondary border-b border-border-primary shrink-0">
        <h2 className="text-xs font-bold text-text-primary tracking-widest">
          X86 PSEUDO-ASSEMBLY
        </h2>
        <span className="ml-4 text-xs text-text-muted">
          {assembly.length} instructions
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-[#1E232D]">
        <div className="space-y-0.5">
          {assembly.map((inst, idx) => {
            // Is it a label or section?
            const isLabel = inst.op.endsWith(':') || inst.op.startsWith('.')

            return (
              <div
                key={inst.id}
                className={
                  'flex font-mono py-1 px-2 rounded hover:bg-bg-secondary/80 transition-colors cursor-pointer group ' +
                  (isLabel ? 'mt-4' : '')
                }
                onMouseEnter={() => handleMouseEnter(inst.sourceNodeId)}
                onMouseLeave={handleMouseLeave}
                title={
                  isBeginner
                    ? ASM_GLOSSARY[inst.op] || `${inst.op} instruction`
                    : `Instruction ID: ${inst.id}`
                }
              >
                {/* Line number */}
                <div className="w-12 text-right pr-4 text-text-muted opacity-50 select-none">
                  {idx + 1}
                </div>

                {/* Instruction */}
                <div className="flex-1 flex space-x-2">
                  {isLabel ? (
                    <span className="text-warning font-bold">{inst.op}</span>
                  ) : (
                    <>
                      <span className="w-16 text-info font-bold">
                        {inst.op}
                      </span>
                      <span className="text-text-primary">
                        {inst.args.join(', ')}
                      </span>
                    </>
                  )}
                </div>

                {/* Comment */}
                <div className="w-1/3 text-text-muted italic opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden text-ellipsis text-right pl-4">
                  {inst.comment ? '; ' + inst.comment : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
