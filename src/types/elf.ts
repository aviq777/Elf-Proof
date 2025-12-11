export interface ElfSighting {
  id: string;
  type: "image" | "video";
  sceneImageUri?: string;
  compositeImageUri?: string;
  videoUri?: string;
  timestamp: number;
  location?: string;
  isFavorite: boolean;
}

export interface GenerationState {
  isGenerating: boolean;
  progress: number;
  stage: "idle" | "analyzing" | "compositing" | "rendering" | "finalizing" | "complete" | "error";
  message: string;
}

export type CameraMode = "photo" | "video";
