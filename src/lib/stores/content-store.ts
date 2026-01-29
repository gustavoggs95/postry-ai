import { create } from 'zustand';

export type ContentStatus = 'draft' | 'approved' | 'published' | 'archived';
export type ContentPlatform = 'linkedin' | 'tiktok' | 'twitter' | 'instagram';

export interface GeneratedContent {
  linkedin?: string;
  tiktok?: string;
  twitter?: string;
  instagram?: string;
}

export interface Content {
  id: string;
  user_id: string;
  brand_id: string | null;
  project_id: string | null;
  source_url?: string;
  source_text?: string;
  generated_content: GeneratedContent;
  cover_image_url?: string;
  status: ContentStatus;
  scheduled_at?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  brands?: { name: string };
}

interface ContentState {
  contents: Content[];
  selectedContent: Content | null;
  isLoading: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setContents: (contents: Content[]) => void;
  addContent: (content: Content) => void;
  updateContent: (id: string, updates: Partial<Content>) => void;
  deleteContent: (id: string) => void;
  selectContent: (content: Content | null) => void;
  setLoading: (isLoading: boolean) => void;
  setGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
}

export const useContentStore = create<ContentState>()((set) => ({
  contents: [],
  selectedContent: null,
  isLoading: false,
  isGenerating: false,
  error: null,

  setContents: (contents) => set({ contents }),

  addContent: (content) =>
    set((state) => ({
      contents: [content, ...state.contents],
    })),

  updateContent: (id, updates) =>
    set((state) => ({
      contents: state.contents.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      selectedContent:
        state.selectedContent?.id === id
          ? { ...state.selectedContent, ...updates }
          : state.selectedContent,
    })),

  deleteContent: (id) =>
    set((state) => ({
      contents: state.contents.filter((c) => c.id !== id),
      selectedContent: state.selectedContent?.id === id ? null : state.selectedContent,
    })),

  selectContent: (content) => set({ selectedContent: content }),

  setLoading: (isLoading) => set({ isLoading }),

  setGenerating: (isGenerating) => set({ isGenerating }),

  setError: (error) => set({ error }),
}));
