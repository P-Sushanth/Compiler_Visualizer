import { create } from 'zustand';
import type { CompilerStage } from '@/types/compiler';

type UIState = {
  activeStage: CompilerStage;
  setActiveStage: (stage: CompilerStage) => void;
};

export const useUIStore = create<UIState>((set) => ({
  activeStage: 'lexer',
  setActiveStage: (stage) => set({ activeStage: stage }),
}));
