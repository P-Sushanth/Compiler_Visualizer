import { AppLayout } from '@/layouts/AppLayout';
import { EditorPanel } from '@/components/EditorPanel';
import { VisualizationPanel } from '@/components/VisualizationPanel';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <AppLayout>
      <EditorPanel />
      <ErrorBoundary>
        <VisualizationPanel />
      </ErrorBoundary>
    </AppLayout>
  )
}

export default App
