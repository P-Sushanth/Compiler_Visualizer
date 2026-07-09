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
import { WorkerManager } from '@/services/WorkerManager';
import { ASTNodeUI } from './ASTNodeUI';
import type { LayoutOutput } from '@/workers/layout.worker';
import type { AST } from '@/types/compiler';

const nodeTypes = {
  astNode: ASTNodeUI,
};

export function ASTGraph() {
  const ast = useCompilerStore(state => state.ast);
  
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // Initialize layout worker
  const layoutWorker = useMemo(() => {
    return new WorkerManager<AST, LayoutOutput>(
      new Worker(new URL('../../workers/layout.worker.ts', import.meta.url), { type: 'module' })
    );
  }, []);

  useEffect(() => {
    let active = true;

    async function calculateLayout() {
      if (!ast || !ast.nodes || Object.keys(ast.nodes).length === 0) {
        setNodes([]);
        setEdges([]);
        return;
      }
      
      setIsCalculating(true);
      try {
        const result = await layoutWorker.execute(ast);
        if (active) {
          setNodes(result.nodes);
          setEdges(result.edges);
        }
      } catch (err) {
        console.error('Layout computation failed', err);
      } finally {
        if (active) setIsCalculating(false);
      }
    }

    calculateLayout();

    return () => {
      active = false;
    };
  }, [ast, layoutWorker]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  if (!ast || Object.keys(ast.nodes || {}).length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-text-muted text-sm font-mono">
        Compile code to view the Abstract Syntax Tree (AST)
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-bg-primary">
      {isCalculating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-bg-primary bg-opacity-80 backdrop-blur-sm">
          <span className="text-info font-mono text-sm animate-pulse">Calculating Graph Layout...</span>
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
  );
}
