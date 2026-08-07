import { useUIStore } from '@/store/uiStore';
import type { CompilerStage } from '@/types/compiler';

const STAGES: { id: CompilerStage; label: string; title: string }[] = [
  { id: 'lexer', label: 'LEX', title: 'Lexical Analysis' },
  { id: 'parser', label: 'AST', title: 'Syntax Analysis (AST)' },
  { id: 'semantic', label: 'SEM', title: 'Semantic Analysis' },
  { id: 'ir', label: 'IR', title: 'Intermediate Representation' },
  { id: 'optimizer', label: 'OPT', title: 'Optimization Passes' },
  { id: 'assembly', label: 'ASM', title: 'Assembly Generation' },
];

export function Sidebar() {
  const { activeStage, setActiveStage } = useUIStore();

  return (
    <aside 
      className="w-16 bg-bg-secondary border-r border-border-primary flex flex-col items-center py-4 space-y-4 shrink-0 z-10"
      role="navigation"
      aria-label="Compiler Stages Navigation"
    >
      {STAGES.map((stage) => (
        <button
          key={stage.id}
          onClick={() => setActiveStage(stage.id)}
          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-info focus-visible:outline-none ${
            activeStage === stage.id
              ? 'bg-info/20 text-info border border-info'
              : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border border-transparent'
          }`}
          title={stage.title}
          aria-label={`View ${stage.title} stage`}
          aria-pressed={activeStage === stage.id}
        >
          <span className="font-mono text-xs font-bold">{stage.label}</span>
        </button>
      ))}
    </aside>
  );
}
