import { create } from 'zustand';
import type { CompilerStage } from '@/types/compiler';

type UIState = {
  activeStage: CompilerStage;
  setActiveStage: (stage: CompilerStage) => void;
  isConsoleOpen: boolean;
  setConsoleOpen: (open: boolean) => void;
  activeConsoleTab: 'problems' | 'output';
  setActiveConsoleTab: (tab: 'problems' | 'output') => void;
};

export const useUIStore = create<UIState>((set) => ({
  activeStage: 'lexer',
  setActiveStage: (stage) => set({ activeStage: stage }),
  isConsoleOpen: false,
  setConsoleOpen: (open) => set({ isConsoleOpen: open }),
  activeConsoleTab: 'problems',
  setActiveConsoleTab: (tab) => set({ activeConsoleTab: tab }),
}));
