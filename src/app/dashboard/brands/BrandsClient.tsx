'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { Plus, MoreVertical, Edit2, Trash2, Star, Search, Palette } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBrandStore, Brand, BrandTone } from '@/lib/stores';
import BrandModal from './BrandModal';

interface BrandsClientProps {
  user: User;
  initialBrands: Brand[];
}

const toneColors: Record<BrandTone, string> = {
  professional: 'bg-blue-500/20 text-blue-400',
  casual: 'bg-green-500/20 text-green-400',
  friendly: 'bg-yellow-500/20 text-yellow-400',
  authoritative: 'bg-purple-500/20 text-purple-400',
  playful: 'bg-pink-500/20 text-pink-400',
};

export default function BrandsClient({ user, initialBrands }: BrandsClientProps) {
  const supabase = createClient();
  const { brands, setBrands, deleteBrand, setDefaultBrand } = useBrandStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands, setBrands]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete brand');
    } else {
      deleteBrand(id);
      toast.success('Brand deleted successfully');
    }
    setOpenMenuId(null);
  };

  const handleSetDefault = async (id: string) => {
    // First, unset all defaults
    await supabase.from('brands').update({ is_default: false }).eq('user_id', user.id);
    // Then set the new default
    const { error } = await supabase.from('brands').update({ is_default: true }).eq('id', id);
    if (error) {
      toast.error('Failed to set default brand');
    } else {
      setDefaultBrand(id);
      toast.success('Default brand updated');
    }
    setOpenMenuId(null);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const filteredBrands = brands.filter(
    (brand) =>
      brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      brand.industry?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Brand Presets</h1>
          <p className="text-sm text-foreground-muted">
            Save your brand voice for consistent content generation
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" />
          New Brand
        </button>
      </header>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length === 0 ? (
          <div className="card py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-background-tertiary">
              <Palette className="h-8 w-8 text-foreground-muted" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-foreground">
              {searchQuery ? 'No brands found' : 'No brand presets yet'}
            </h3>
            <p className="mb-4 text-foreground-muted">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first brand preset to maintain consistent voice across all content'}
            </p>
            {!searchQuery && (
              <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                Create Brand Preset
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredBrands.map((brand) => (
              <div key={brand.id} className="card group relative">
                {brand.is_default && (
                  <div className="absolute right-12 top-4 flex items-center gap-1 rounded-full bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                    <Star className="h-3 w-3 fill-current" />
                    Default
                  </div>
                )}

                {/* Menu Button */}
                <div className="absolute right-4 top-4">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === brand.id ? null : brand.id)}
                    className="rounded-lg p-1 text-foreground-muted transition-colors hover:bg-background-tertiary hover:text-foreground"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {openMenuId === brand.id && (
                    <div className="absolute right-0 top-8 z-10 w-40 rounded-lg border border-border bg-background-secondary shadow-xl">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-background-tertiary"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      {!brand.is_default && (
                        <button
                          onClick={() => handleSetDefault(brand.id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-background-tertiary"
                        >
                          <Star className="h-4 w-4" />
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-error transition-colors hover:bg-error/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{brand.name}</h3>
                  {brand.description && (
                    <p className="line-clamp-2 text-sm text-foreground-muted">
                      {brand.description}
                    </p>
                  )}
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium capitalize ${toneColors[brand.tone]}`}
                  >
                    {brand.tone}
                  </span>
                  {brand.use_emojis && (
                    <span className="rounded-full bg-accent/20 px-2 py-1 text-xs font-medium text-accent">
                      Uses Emojis
                    </span>
                  )}
                </div>

                {brand.industry && (
                  <p className="mb-2 text-xs text-foreground-muted">
                    <span className="font-medium">Industry:</span> {brand.industry}
                  </p>
                )}

                {brand.target_audience && (
                  <p className="mb-2 text-xs text-foreground-muted">
                    <span className="font-medium">Audience:</span> {brand.target_audience}
                  </p>
                )}

                {brand.keywords && brand.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {brand.keywords.slice(0, 3).map((keyword, i) => (
                      <span
                        key={i}
                        className="rounded bg-background-tertiary px-2 py-0.5 text-xs text-foreground-muted"
                      >
                        {keyword}
                      </span>
                    ))}
                    {brand.keywords.length > 3 && (
                      <span className="px-2 py-0.5 text-xs text-foreground-muted">
                        +{brand.keywords.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBrand={editingBrand}
        userId={user.id}
      />
    </>
  );
}
