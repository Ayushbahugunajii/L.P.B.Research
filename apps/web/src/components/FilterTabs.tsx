import React from 'react';
import { Layers, Video, FileText, Globe } from 'lucide-react';
import { useAppStore } from '../lib/store';

interface FilterTabsProps {
  counts?: {
    videos?: number;
    papers?: number;
    web?: number;
  };
}

export const FilterTabs: React.FC<FilterTabsProps> = ({ counts }) => {
  const { activeTab, setActiveTab } = useAppStore();

  const total = (counts?.videos || 0) + (counts?.papers || 0) + (counts?.web || 0);

  const tabs = [
    {
      id: 'all' as const,
      label: 'All Results',
      icon: Layers,
      count: total
    },
    {
      id: 'video' as const,
      label: 'Key Moments (Videos)',
      icon: Video,
      count: counts?.videos || 0
    },
    {
      id: 'paper' as const,
      label: 'Research Papers',
      icon: FileText,
      count: counts?.papers || 0
    },
    {
      id: 'web' as const,
      label: 'Web Articles (Passages)',
      icon: Globe,
      count: counts?.web || 0
    }
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border/60 scrollbar-none">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
              isActive
                ? 'bg-primary/10 text-primary border border-primary/30 shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
