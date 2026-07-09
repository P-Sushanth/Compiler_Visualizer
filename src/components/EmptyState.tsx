import React from 'react';
import { useCompilerStore } from '@/store/compilerStore';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  const status = useCompilerStore((state) => state.status);

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-6 bg-bg-primary text-center">
      <div className="bg-bg-tertiary border border-border-primary rounded-xl p-8 flex flex-col items-center max-w-md w-full shadow-lg transition-all duration-300">
        
        {status === 'running' ? (
          <div className="mb-4 relative flex items-center justify-center w-16 h-16">
            <div className="absolute inset-0 border-4 border-t-info border-r-transparent border-b-info border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-t-transparent border-r-warning border-b-transparent border-l-warning rounded-full animate-spin direction-reverse"></div>
          </div>
        ) : icon ? (
          <div className="mb-4 text-text-muted opacity-50">
            {icon}
          </div>
        ) : (
          <div className="mb-4 w-12 h-12 bg-bg-secondary border border-border-primary rounded-lg flex items-center justify-center shadow-inner">
            <div className="w-6 h-6 border-2 border-dashed border-text-muted rounded"></div>
          </div>
        )}

        <h3 className="text-text-primary font-bold tracking-wide mb-2">
          {status === 'running' ? 'Compiling...' : title}
        </h3>
        
        <p className="text-text-muted text-sm leading-relaxed">
          {status === 'running' 
            ? 'The compiler pipeline is processing your code. Visualizations will be available shortly.'
            : description}
        </p>

        {status === 'error' && (
          <div className="mt-6 w-full p-3 bg-error bg-opacity-10 border border-error border-opacity-20 rounded text-error text-xs text-left">
            <span className="font-bold uppercase tracking-wider block mb-1">Compilation Failed</span>
            Check the editor for syntax or semantic errors before visualizing this stage.
          </div>
        )}
      </div>
    </div>
  );
}
