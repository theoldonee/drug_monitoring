import { create } from 'zustand';

interface CategoryInterface{
  severity: string;
  category: string;

  setCategory: (category: string) => void;
  setSeverity: (severity: string) => void;

}

export const useCategoryStore = create<CategoryInterface>((set) => ({
  severity: "",
  category: "", 

  setCategory: (category) => set({ category }),
  setSeverity: (severity) => set({ severity }),
}))