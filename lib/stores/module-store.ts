import { create } from "zustand"

interface Slide {
  id: string
  title: string
  content: string
  // Add other slide properties as needed
  [key: string]: any
}

interface Module {
  id: string
  title: string
  description: string
  icon: string
  duration: string
  level: string
  image: string
  slides: Slide[]
  averageRating: number
  totalReviews: number
}

interface ModuleState {
  modules: Module[]
  currentModule: Module | null
  currentSlide: number // This is the 1-based index of the current slide
  isLoading: boolean
  setModules: (modules: Module[]) => void
  setCurrentModule: (module: Module) => void
  setCurrentSlide: (slide: number) => void
  setLoading: (loading: boolean) => void
  nextSlide: () => void
  previousSlide: () => void
}

export const useModuleStore = create<ModuleState>((set, get) => ({
  modules: [],
  currentModule: null,
  currentSlide: 1,
  isLoading: false,

  setModules: (modules) => set({ modules }),
  setCurrentModule: (module) => set({ currentModule: module, currentSlide: 1 }),
  setCurrentSlide: (slide) => set({ currentSlide: slide }),
  setLoading: (loading) => set({ isLoading: loading }),

  nextSlide: () => {
    const { currentModule, currentSlide } = get()
    if (currentModule && currentSlide < (currentModule.slides?.length || 0)) {
      set({ currentSlide: currentSlide + 1 })
    }
  },

  previousSlide: () => {
    const { currentSlide } = get()
    if (currentSlide > 1) {
      set({ currentSlide: currentSlide - 1 })
    }
  },
}))
