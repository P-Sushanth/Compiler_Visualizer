import dagre from 'dagre'
import type { WorkerRequest, WorkerResponse } from '../types/worker'
import type { IRProgram } from '../types/compiler'

export type IRLayoutOutput = {
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
    label?: string
    style?: any
  }>
}

self.onmessage = (event: MessageEvent<WorkerRequest<IRProgram>>) => {
  const request = event.data
  const ir = request.payload

  if (!ir || !ir.blocks || Object.keys(ir.blocks).length === 0) {
    self.postMessage({
      requestId: request.requestId,
      success: true,
      data: { nodes: [], edges: [] },
      error: null,
    })
    return
  }

  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 })
  g.setDefaultEdgeLabel(() => ({}))

  const nodes: any[] = []
  const edges: any[] = []

  // Add blocks to graph
  Object.values(ir.blocks).forEach((block) => {
    // Height depends on number of instructions approx
    const height = 40 + block.instructionIds.length * 24
    g.setNode(block.id, { width: 250, height })
  })

  // Add edges
  Object.values(ir.blocks).forEach((block) => {
    if (block.successorBlockIds) {
      block.successorBlockIds.forEach((succId, index) => {
        g.setEdge(block.id, succId)

        let label = ''
        let strokeColor = '#6E7681' // default edge

        // simple heuristic: if block ends with JUMPIFNOT,
        // first successor is true branch (fallthrough), second is false branch (jump)
        // Wait, in our IRGenerator, JUMPIFNOT is emitted, followed by linkBlocks(fallthrough), linkBlocks(jump)
        const lastInstId = block.instructionIds[block.instructionIds.length - 1]
        const lastInst = lastInstId ? ir.instructions[lastInstId] : null

        if (lastInst && lastInst.opcode.startsWith('JUMPIF')) {
          if (index === 0) {
            label = 'True'
            strokeColor = '#238636' // green for true path
          } else {
            label = 'False'
            strokeColor = '#DA3633' // red for false path
          }
        }

        edges.push({
          id: block.id + '-' + succId,
          source: block.id,
          target: succId,
          animated: true,
          label,
          style: { stroke: strokeColor, strokeWidth: 2 },
        })
      })
    }
  })

  // Calculate layout
  dagre.layout(g)

  // Map to ReactFlow format
  Object.values(ir.blocks).forEach((block) => {
    const layoutNode = g.node(block.id)
    if (!layoutNode) return

    // Pass full instructions data into node
    const instructionsData = block.instructionIds.map(
      (id) => ir.instructions[id],
    )

    nodes.push({
      id: block.id,
      type: 'basicBlock',
      position: {
        x: layoutNode.x - layoutNode.width / 2,
        y: layoutNode.y - layoutNode.height / 2,
      },
      data: {
        label: block.label,
        instructions: instructionsData,
        isEntry: block.id === ir.entryBlockId,
      },
    })
  })

  const response: WorkerResponse<IRLayoutOutput> = {
    requestId: request.requestId,
    success: true,
    data: { nodes, edges },
    error: null,
  }

  self.postMessage(response)
}
