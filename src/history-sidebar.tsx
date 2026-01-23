import React from 'react';
import { Clock, ChevronLeft, ChevronRight, Image as ImageIcon, Trash2 } from 'lucide-react';

export interface HistoryItem {
  id: string;
  timestamp: number;
  imageUrl: string;
  prompt: string;
  settings: {
    size: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
    sharpness: string;
    quality: string;
    orientation: string;
    lighting?: string;
    model?: string;
  };
}

interface HistorySidebarProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClear?: () => void;
}

export default function HistorySidebar({ items, onSelect, isOpen, onToggle, onClear }: HistorySidebarProps) {
  return (
    <>
      {/* Toggle Button - Visible when closed */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 z-50 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-r-xl shadow-lg transition-all duration-200 backdrop-blur-sm border border-l-0 border-gray-200"
          title="Show History"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar Container */}
      <div
        style={{ height: '100%' }}
        className={'absolute md:relative top-0 left-0 h-full bg-white/95 backdrop-blur-md shadow-2xl transition-all duration-300 ease-in-out z-40 flex flex-col border-r border-gray-200 ' + (isOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full md:w-0 md:translate-x-0 overflow-hidden')}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between min-w-[320px]">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-xl">
            <Clock className="w-6 h-6" />
            <span>History</span>
          </div>
          <div className="flex items-center gap-1">
            {onClear && items.length > 0 && (
              <button
                 onClick={onClear}
                 className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                 title="Clear History"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onToggle}
              className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-w-[320px]">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 flex flex-col items-center gap-3">
              <Clock className="w-12 h-12 opacity-20" />
              <p>No history yet</p>
              <p className="text-sm opacity-60">Generate images to see them here</p>
            </div>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full bg-white border border-gray-200 hover:border-teal-400 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 group text-left flex gap-3 group"
              >
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                   {item.imageUrl ? (
                     <img src={item.imageUrl} alt="thumbnail" className="w-full h-full object-cover" />
                   ) : (
                     <ImageIcon className="w-full h-full p-4 text-gray-300" />
                   )}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="font-medium text-gray-800 truncate text-sm mb-1" title={item.prompt}>
                    {item.prompt || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                     {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                     {item.settings.size}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
}
