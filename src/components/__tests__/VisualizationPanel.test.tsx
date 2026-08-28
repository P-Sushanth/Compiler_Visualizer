import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { VisualizationPanel } from '../VisualizationPanel'
import { useUIStore } from '@/store/uiStore'

// Mock all lazy-loaded subcomponents to isolate the panel routing logic
vi.mock('@/features/lexer/TokenTable', () => ({
  TokenTable: () => <div data-testid="lexer-view">Mock Token Table</div>,
}))
vi.mock('@/features/parser/ASTGraph', () => ({
  ASTGraph: () => <div data-testid="parser-view">Mock AST Graph</div>,
}))
vi.mock('@/features/semantic/SemanticViewer', () => ({
  SemanticViewer: () => (
    <div data-testid="semantic-view">Mock Semantic Viewer</div>
  ),
}))
vi.mock('@/features/ir/IRViewer', () => ({
  IRViewer: () => <div data-testid="ir-view">Mock IR Viewer</div>,
}))
vi.mock('@/features/optimizer/OptimizerViewer', () => ({
  OptimizerViewer: () => (
    <div data-testid="optimizer-view">Mock Optimizer Viewer</div>
  ),
}))
vi.mock('@/features/assembly/AssemblyViewer', () => ({
  AssemblyViewer: () => (
    <div data-testid="assembly-view">Mock Assembly Viewer</div>
  ),
}))
vi.mock('@/features/compare/ComparisonViewer', () => ({
  ComparisonViewer: () => (
    <div data-testid="compare-view">Mock Comparison Viewer</div>
  ),
}))

describe('VisualizationPanel Component', () => {
  beforeEach(() => {
    useUIStore.setState({ activeStage: 'lexer' })
  })

  it('renders Lexer view when activeStage is lexer', async () => {
    render(<VisualizationPanel />)
    expect(screen.getByText(/visualization panel/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('lexer-view')).toBeInTheDocument()
    })
  })

  it('renders Parser view when activeStage is parser', async () => {
    useUIStore.setState({ activeStage: 'parser' })
    render(<VisualizationPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('parser-view')).toBeInTheDocument()
    })
  })

  it('renders Semantic view when activeStage is semantic', async () => {
    useUIStore.setState({ activeStage: 'semantic' })
    render(<VisualizationPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('semantic-view')).toBeInTheDocument()
    })
  })

  it('renders IR view when activeStage is ir', async () => {
    useUIStore.setState({ activeStage: 'ir' })
    render(<VisualizationPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('ir-view')).toBeInTheDocument()
    })
  })

  it('renders Optimizer view when activeStage is optimizer', async () => {
    useUIStore.setState({ activeStage: 'optimizer' })
    render(<VisualizationPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('optimizer-view')).toBeInTheDocument()
    })
  })

  it('renders Assembly view when activeStage is assembly', async () => {
    useUIStore.setState({ activeStage: 'assembly' })
    render(<VisualizationPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('assembly-view')).toBeInTheDocument()
    })
  })

  it('renders Comparison view when activeStage is compare', async () => {
    useUIStore.setState({ activeStage: 'compare' })
    render(<VisualizationPanel />)

    await waitFor(() => {
      expect(screen.getByTestId('compare-view')).toBeInTheDocument()
    })
  })
})
