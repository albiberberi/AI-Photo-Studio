import { useState } from 'react'
import PhotoUploadInterface from './photo-upload-interface'
import MainUI from './main-ui'
import type { HistoryItem } from './history-sidebar'

function App() {
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  
  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [initialSettings, setInitialSettings] = useState<HistoryItem['settings'] | undefined>(undefined);

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

  const handleUploadSubmit = (images: string[], desc: string) => {
    setUploadedImages(images);
    setDescription(desc);
    setInitialSettings(undefined); // Reset settings for new upload
  };

  const handleBackToUpload = () => {
    setUploadedImages([]);
    setDescription('');
    setInitialSettings(undefined);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    // When selecting from Upload screen, we want to load this item into MainUI
    setUploadedImages([item.imageUrl]); // Use the generated/history image as the input?
    setDescription(item.prompt);
    setInitialSettings(item.settings);
  };

  if (uploadedImages.length > 0) {
    return (
      <MainUI 
        uploadedImages={uploadedImages} 
        description={description}
        onBack={handleBackToUpload}
        history={history}
        addToHistory={addToHistory}
        onClearHistory={onClearHistory}
        initialSettings={initialSettings}
      />
    );
  }

  return (
    <PhotoUploadInterface 
      onSubmit={handleUploadSubmit}
      history={history}
      onHistorySelect={handleHistorySelect}
      onClearHistory={onClearHistory}
    />
  );
}

export default App