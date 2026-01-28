'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const supabase = createClient();
  const { brands, setBrands, deleteBrand, setDefaultBrand } = useBrandStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    setBrands(initialBrands);
  }, [initialBrands, setBrands]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (!error) {
      deleteBrand(id);
    }
    setOpenMenuId(null);
  };

  const handleSetDefault = async (id: string) => {
    // First, unset all defaults
    await supabase.from('brands').update({ is_default: false }).eq('user_id', user.id);
    // Then set the new default
    const { error } = await supabase.from('brands').update({ is_default: true }).eq('id', id);
    if (!error) {
      setDefaultBrand(id);
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
      <header className="border-border flex h-16 items-center justify-between border-b px-6">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Brand Presets</h1>
          <p className="text-foreground-muted text-sm">
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
            <Search className="text-foreground-muted absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
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
            <div className="bg-background-tertiary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
              <Palette className="text-foreground-muted h-8 w-8" />
            </div>
            <h3 className="text-foreground mb-2 text-lg font-medium">
              {searchQuery ? 'No brands found' : 'No brand presets yet'}
            </h3>
            <p className="text-foreground-muted mb-4">
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
                  <div className="bg-primary/20 text-primary absolute right-12 top-4 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium">
                    <Star className="h-3 w-3 fill-current" />
                    Default
                  </div>
                )}

                {/* Menu Button */}
                <div className="absolute right-4 top-4">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === brand.id ? null : brand.id)}
                    className="hover:bg-background-tertiary text-foreground-muted hover:text-foreground rounded-lg p-1 transition-colors"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {openMenuId === brand.id && (
                    <div className="bg-background-secondary border-border absolute right-0 top-8 z-10 w-40 rounded-lg border shadow-xl">
                      <button
                        onClick={() => handleEdit(brand)}
                        className="text-foreground hover:bg-background-tertiary flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      {!brand.is_default && (
                        <button
                          onClick={() => handleSetDefault(brand.id)}
                          className="text-foreground hover:bg-background-tertiary flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                        >
                          <Star className="h-4 w-4" />
                          Set as Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="text-error hover:bg-error/10 flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <h3 className="text-foreground mb-1 text-lg font-semibold">{brand.name}</h3>
                  {brand.description && (
                    <p className="text-foreground-muted line-clamp-2 text-sm">
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
                    <span className="bg-accent/20 text-accent rounded-full px-2 py-1 text-xs font-medium">
                      Uses Emojis
                    </span>
                  )}
                </div>

                {brand.industry && (
                  <p className="text-foreground-muted mb-2 text-xs">
                    <span className="font-medium">Industry:</span> {brand.industry}
                  </p>
                )}

                {brand.target_audience && (
                  <p className="text-foreground-muted mb-2 text-xs">
                    <span className="font-medium">Audience:</span> {brand.target_audience}
                  </p>
                )}

                {brand.keywords && brand.keywords.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {brand.keywords.slice(0, 3).map((keyword, i) => (
                      <span
                        key={i}
                        className="bg-background-tertiary text-foreground-muted rounded px-2 py-0.5 text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                    {brand.keywords.length > 3 && (
                      <span className="text-foreground-muted px-2 py-0.5 text-xs">
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
