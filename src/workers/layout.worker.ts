import dagre from 'dagre'
import type { WorkerRequest, WorkerResponse } from '../types/worker'
import type { AST } from '../types/compiler'

export type LayoutOutput = {
  nodes: Array<{
    id: string
    type: string
    position: { x: number; y: number }
    data: any
  }>
  edges: Array<{
    id: string
    source: string
    target: string
    animated?: boolean
  }>
}

self.onmessage = (event: MessageEvent<WorkerRequest<AST>>) => {
  const request = event.data
  const ast = request.payload

  if (!ast || !ast.nodes || Object.keys(ast.nodes).length === 0) {
    self.postMessage({
      requestId: request.requestId,
      success: true,
      data: { nodes: [], edges: [] },
      error: null,
    })
    return
  }

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40 })
  g.setDefaultEdgeLabel(() => ({}))

  const nodes: any[] = []
  const edges: any[] = []

  // Add all nodes to graph
  Object.values(ast.nodes).forEach((astNode) => {
    // We give a fixed size for dagre layout approximation
    g.setNode(astNode.id, { width: 180, height: 60 })
  })

  // Add edges
  Object.values(ast.nodes).forEach((astNode) => {
    if (astNode.children) {
      astNode.children.forEach((childId) => {
        g.setEdge(astNode.id, childId)
        edges.push({
          id: `${astNode.id}-${childId}`,
          source: astNode.id,
          target: childId,
          animated: true,
        })
      })
    }
  })

  // Calculate layout
  dagre.layout(g)

  // Map to ReactFlow format
  Object.values(ast.nodes).forEach((astNode) => {
    const layoutNode = g.node(astNode.id)
    if (!layoutNode) return

    // Determine label/data
    const label = astNode.type
    let details = ''

    if ('name' in astNode) details = (astNode as any).name
    else if ('identifier' in astNode) details = (astNode as any).identifier
    else if ('operator' in astNode) details = (astNode as any).operator
    else if ('value' in astNode && (astNode as any).value !== null)
      details = String((astNode as any).value)

    nodes.push({
      id: astNode.id,
      type: 'astNode',
      position: {
        x: layoutNode.x - layoutNode.width / 2,
        y: layoutNode.y - layoutNode.height / 2,
      },
      data: {
        label,
        details,
        range: astNode.range,
        nodeType: astNode.type,
      },
    })
  })

  const response: WorkerResponse<LayoutOutput> = {
    requestId: request.requestId,
    success: true,
    data: { nodes, edges },
    error: null,
  }

  self.postMessage(response)
}
