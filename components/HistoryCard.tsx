
import React from 'react';
import { ImageHistoryItem } from '../types';

interface HistoryCardProps {
  item: ImageHistoryItem;
  onClick: (item: ImageHistoryItem) => void;
}

const HistoryCard: React.FC<HistoryCardProps> = ({ item, onClick }) => {
  return (
    <div 
      onClick={() => onClick(item)}
      className="glass p-2 rounded-xl cursor-pointer group hover:scale-105 transition-all duration-300"
    >
      <div className="relative aspect-video overflow-hidden rounded-lg mb-2">
        <img 
          src={item.previewUrl} 
          alt="History item" 
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors" />
      </div>
      <p className="text-[10px] text-slate-400 font-mono truncate">ID: {item.id}</p>
    </div>
  );
};

export default HistoryCard;
