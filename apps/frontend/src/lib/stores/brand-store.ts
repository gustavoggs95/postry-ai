import { create } from 'zustand';

export type BrandTone = 'professional' | 'casual' | 'friendly' | 'authoritative' | 'playful';

export interface Brand {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  tone: BrandTone;
  style?: string;
  use_emojis: boolean;
  target_audience?: string;
  industry?: string;
  keywords?: string[];
  logo_url?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandInput {
  name: string;
  description?: string;
  tone: BrandTone;
  style?: string;
  use_emojis: boolean;
  target_audience?: string;
  industry?: string;
  keywords?: string[];
}

interface BrandState {
  brands: Brand[];
  selectedBrand: Brand | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setBrands: (brands: Brand[]) => void;
  addBrand: (brand: Brand) => void;
  updateBrand: (id: string, updates: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;
  selectBrand: (brand: Brand | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setDefaultBrand: (id: string) => void;
}

export const useBrandStore = create<BrandState>()((set, get) => ({
  brands: [],
  selectedBrand: null,
  isLoading: false,
  error: null,

  setBrands: (brands) => {
    const defaultBrand = brands.find((b) => b.is_default) || brands[0] || null;
    set({ brands, selectedBrand: get().selectedBrand || defaultBrand });
  },

  addBrand: (brand) =>
    set((state) => ({
      brands: [brand, ...state.brands],
      selectedBrand: state.brands.length === 0 ? brand : state.selectedBrand,
    })),

  updateBrand: (id, updates) =>
    set((state) => ({
      brands: state.brands.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      selectedBrand:
        state.selectedBrand?.id === id
          ? { ...state.selectedBrand, ...updates }
          : state.selectedBrand,
    })),

  deleteBrand: (id) =>
    set((state) => {
      const newBrands = state.brands.filter((b) => b.id !== id);
      return {
        brands: newBrands,
        selectedBrand: state.selectedBrand?.id === id ? newBrands[0] || null : state.selectedBrand,
      };
    }),

  selectBrand: (brand) => set({ selectedBrand: brand }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setDefaultBrand: (id) =>
    set((state) => ({
      brands: state.brands.map((b) => ({
        ...b,
        is_default: b.id === id,
      })),
    })),
}));
