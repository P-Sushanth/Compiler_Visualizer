import { AppLayout } from '@/layouts/AppLayout';
import { EditorPanel } from '@/components/EditorPanel';
import { VisualizationPanel } from '@/components/VisualizationPanel';

function App() {
  return (
    <AppLayout>
      <EditorPanel />
      <VisualizationPanel />
    </AppLayout>
  )
}

export default App
