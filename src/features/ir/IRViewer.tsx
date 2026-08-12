import { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges
} from '@xyflow/react';
import type { Node, Edge, NodeChange, EdgeChange } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCompilerStore } from '@/store/compilerStore';
import { useUIStore } from '@/store/uiStore';
import { WorkerManager } from '@/services/WorkerManager';
import { BasicBlockUI } from './BasicBlockUI';
import { StageErrorFallback } from '@/components/StageErrorFallback';
import type { IRLayoutOutput } from '@/workers/irLayout.worker';
import type { IRProgram } from '@/types/compiler';

const nodeTypes = {
  basicBlock: BasicBlockUI,
};

export function IRViewer() {
  const ir = useCompilerStore(state => state.ir);
  const mode = useUIStore(state => state.mode);
  const isBeginner = mode === 'beginner';
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize layout worker
  const layoutWorker = useMemo(() => {
    return new WorkerManager<IRProgram, IRLayoutOutput>(
      () => new Worker(new URL('../../workers/irLayout.worker.ts', import.meta.url), { type: 'module' })
    );
  }, []);

  useEffect(() => {
    return () => {
      layoutWorker.terminate();
    };
  }, [layoutWorker]);

  useEffect(() => {
    let active = true;

    async function calculateLayout() {
      if (!ir || !ir.blocks || Object.keys(ir.blocks).length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }
      
      setIsCalculating(true);
      try {
        const result = await layoutWorker.execute(ir);
        if (active) {
          setNodes(result.nodes);
          setEdges(result.edges);
        }
      } catch (err) {
        console.error('IR Layout computation failed', err);
      } finally {
        if (active) setIsCalculating(false);
      }
    }

    calculateLayout();

    return () => {
      active = false;
    };
  }, [ir, layoutWorker]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  if (!ir || Object.keys(ir.blocks || {}).length === 0) {
    return (
      <StageErrorFallback 
        stage="ir" 
        title="No Intermediate Representation" 
        description="Compile your C code to view the IR Control Flow Graph." 
      />
    );
  }

  return (
    <div className="w-full h-full relative bg-bg-primary flex flex-col">
      {isBeginner && (
        <div className="p-4 bg-bg-tertiary border-b border-border-primary text-xs leading-relaxed text-text-secondary shrink-0 z-10">
          <h3 className="font-bold text-info mb-1 uppercase tracking-wider text-[10px]">What is Intermediate Representation (IR) & CFG?</h3>
          <p>
            The compiler translates the AST into a platform-neutral, simplified language called <strong>Intermediate Representation (IR)</strong>. 
            It groups instructions into <strong>Basic Blocks</strong> (linear sequences of code with a single entry and exit point). 
            These blocks are linked together to form a <strong>Control Flow Graph (CFG)</strong>, showing all possible execution paths (loops, branches).
          </p>
        </div>
      )}
      <div className="flex-1 relative min-h-0">
        {isCalculating && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
            <span className="text-info font-mono text-sm animate-pulse">Calculating CFG Layout...</span>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.1}
          className="bg-bg-primary"
          colorMode="dark"
        >
          <Background color="#2A3140" gap={16} />
          <Controls 
            className="bg-bg-secondary border border-border-primary fill-text-primary text-text-primary"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
