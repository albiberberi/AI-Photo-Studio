import { useState } from 'react'
import LandingPage from './landing-page'
import EditorPage from './editor-page'
import type { HistoryItem } from './history-sidebar'

type PageState = 'landing' | 'editor';

function App() {
  const [currentPage, setCurrentPage] = useState<PageState>('landing');
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (itemData: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...itemData
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const onClearHistory = () => {
    setHistory([]);
  };

  const handleLandingNext = () => {
    setCurrentPage('editor');
  };

  // Landing Page
  if (currentPage === 'landing') {
    return <LandingPage onNext={handleLandingNext} />;
  }

  // Editor Page (unified page with upload, settings, and generation)
  return (
    <EditorPage
      history={history}
      addToHistory={addToHistory}
      onClearHistory={onClearHistory}
    />
  );
}

export default App