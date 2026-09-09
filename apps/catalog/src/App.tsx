import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { EngineProvider } from './engine/EngineProvider';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { EditorDemoPage } from './pages/EditorDemoPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  return (
    <ThemeProvider>
      <EngineProvider>
        <HashRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/topic/:topicId" element={<TopicDetailPage />} />
            <Route path="/editor-demo" element={<EditorDemoPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
      </EngineProvider>
    </ThemeProvider>
  );
}
