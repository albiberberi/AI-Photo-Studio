import React, { useState, useRef, useEffect } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, Mic, MicOff } from 'lucide-react';
import logoimg from './assets/Logo.png'
import HistorySidebar, { type HistoryItem } from './history-sidebar';

interface PhotoUploadInterfaceProps {
  onSubmit: (images: string[], description: string) => void;
  history: HistoryItem[];
  onHistorySelect: (item: HistoryItem) => void;
  onClearHistory: () => void;
}

export default function PhotoUploadInterface({ 
  onSubmit, 
  history, 
  onHistorySelect, 
  onClearHistory 
}: PhotoUploadInterfaceProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [thoughts, setThoughts] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event) => {
          console.log('Speech recognition result received');
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            console.log('Transcript:', transcript, 'isFinal:', event.results[i].isFinal);
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          // Update interim results for live feedback
          setInterimText(interimTranscript);

          // Add final results to the thoughts field
          if (finalTranscript) {
            setThoughts(prev => {
              const newText = prev + finalTranscript;
              console.log('Updated thoughts:', newText);
              return newText;
            });
            setInterimText(''); // Clear interim text after adding final
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'no-speech') {
            console.log('No speech detected, try speaking louder');
          }
          setIsListening(false);
          setInterimText('');
        };

        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
          setInterimText('');
        };
      }
    } else {
      console.error('Speech recognition not supported');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Распознавание речи не поддерживается в вашем браузере. Пожалуйста, используйте Chrome, Edge или Safari.');
      return;
    }

    if (isListening) {
      console.log('Stopping speech recognition');
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      console.log('Starting speech recognition');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Error starting recognition:', error);
      }
    }
  };

  const handleSubmit = () => {
    if (previewUrls.length === 0) {
      alert('Пожалуйста, загрузите хотя бы одно изображение');
      return;
    }
    if (!thoughts.trim()) {
      alert('Пожалуйста, добавьте описание');
      return;
    }
    onSubmit(previewUrls, thoughts);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreviewUrls(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    } else {
      alert('Пожалуйста, загрузите файл изображения');
    }
  };

  const removeImage = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col overflow-hidden">
      {/* Logo in top left */}
      <div className="absolute top-6 left-6 z-10">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
          <img src={logoimg} alt="Logo" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* History Section at Top */}
      <div className="w-full bg-white border-b border-gray-200 shadow-sm py-4 px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">История генераций</h2>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              {isSidebarOpen ? 'Скрыть' : 'Показать'} историю
            </button>
          </div>
          {history.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => onHistorySelect(item)}
                  className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-teal-400 transition-all shadow-sm hover:shadow-md"
                >
                  <img src={item.imageUrl} alt="History" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {history.length === 0 && (
            <p className="text-gray-500 text-sm">История пуста. Создайте первое изображение!</p>
          )}
        </div>
      </div>

      <HistorySidebar
        items={history}
        onSelect={onHistorySelect}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onClear={onClearHistory}
      />
      
      <div className="flex-1 relative w-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center p-6 relative">

          {/* Main Container */}
          <div className="w-full max-w-4xl">
            <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
              Загрузите фотографии для редактирования
            </h1>

            {/* Upload Area */}
            <div
              className={`bg-white rounded-lg border-4 border-dashed transition-all duration-200 ${
                isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300'
              } p-16 mb-6`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!previewUrls.length ? (
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-16 h-16 mb-6 text-gray-700" strokeWidth={2} />
                  <p className="text-2xl font-medium text-gray-800 mb-4">
                    Перетащите изображения сюда
                  </p>
                  <p className="text-xl text-gray-600 mb-6">или</p>
                  <button
                    onClick={handleSelectClick}
                    className="bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white px-12 py-4 rounded-lg text-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Выбрать файлы
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg shadow-md"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    
                    <button
                      onClick={handleSelectClick}
                      className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-teal-500 hover:text-teal-500 transition-colors"
                    >
                      <Upload className="w-8 h-8 mb-2" />
                      <span>Add another</span>
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Thoughts Input */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <textarea
                  value={thoughts + (interimText ? ' ' + interimText : '')}
                  onChange={(e) => setThoughts(e.target.value)}
                  placeholder="Опишите что вы хотите создать..."
                  className="w-full bg-white rounded-lg px-6 py-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 resize-none"
                  rows={3}
                />
                {interimText && (
                  <span className="absolute bottom-6 right-6 text-xs text-gray-400 italic">
                    (speaking...)
                  </span>
                )}
              </div>
              <button 
                onClick={toggleListening}
                className={`rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 self-end ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500'
                }`}
                title={isListening ? 'Stop recording' : 'Start recording'}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>
            </div>
            
            {isListening && (
              <p className="text-center mb-4 text-gray-700 text-sm">
                🎤 Идет запись... Говорите четко в микрофон
              </p>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={previewUrls.length === 0 || !thoughts.trim()}
              className={`w-full py-4 rounded-lg text-xl font-medium shadow-lg transition-all duration-200 ${
                previewUrls.length > 0 && thoughts.trim()
                  ? 'bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-white hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Перейти к редактору
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}