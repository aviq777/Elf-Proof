import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ElfSighting, GenerationState } from "../types/elf";

interface ElfStore {
  sightings: ElfSighting[];
  currentSceneUri: string | null;
  generationState: GenerationState;

  // Actions
  addSighting: (sighting: ElfSighting) => void;
  removeSighting: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setCurrentSceneUri: (uri: string | null) => void;
  setGenerationState: (state: Partial<GenerationState>) => void;
  resetGenerationState: () => void;
  clearAllSightings: () => void;
}

const initialGenerationState: GenerationState = {
  isGenerating: false,
  progress: 0,
  stage: "idle",
  message: "",
};

export const useElfStore = create<ElfStore>()(
  persist(
    (set) => ({
      sightings: [],
      currentSceneUri: null,
      generationState: initialGenerationState,

      addSighting: (sighting) =>
        set((state) => ({
          sightings: [sighting, ...state.sightings],
        })),

      removeSighting: (id) =>
        set((state) => ({
          sightings: state.sightings.filter((s) => s.id !== id),
        })),

      toggleFavorite: (id) =>
        set((state) => ({
          sightings: state.sightings.map((s) =>
            s.id === id ? { ...s, isFavorite: !s.isFavorite } : s
          ),
        })),

      setCurrentSceneUri: (uri) => set({ currentSceneUri: uri }),

      setGenerationState: (newState) =>
        set((state) => ({
          generationState: { ...state.generationState, ...newState },
        })),

      resetGenerationState: () =>
        set({ generationState: initialGenerationState }),

      clearAllSightings: () => set({ sightings: [] }),
    }),
    {
      name: "elf-sightings-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sightings: state.sightings,
      }),
    }
  )
);
