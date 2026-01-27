'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import {
  Sparkles,
  LayoutDashboard,
  Palette,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Plus,
  MoreVertical,
  Edit2,
  Trash2,
  Star,
  Search,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useBrandStore, Brand, BrandTone } from '@/lib/stores';
import BrandModal from './BrandModal';

interface BrandsClientProps {
  user: User;
  initialBrands: Brand[];
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Sparkles, label: 'Generate', href: '/dashboard/generate' },
  { icon: Palette, label: 'Brand Presets', href: '/dashboard/brands', active: true },
  { icon: FileText, label: 'Content', href: '/dashboard/content' },
  { icon: Calendar, label: 'Calendar', href: '/dashboard/calendar' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

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

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background-secondary border-r border-border flex flex-col">
        <div className="h-16 flex items-center gap-2 px-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">Postry AI</span>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {sidebarItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    item.active
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground-muted hover:bg-background-tertiary hover:text-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-medium">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-foreground-muted truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground-muted hover:bg-background-tertiary hover:text-foreground transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 border-b border-border flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Brand Presets</h1>
            <p className="text-sm text-foreground-muted">
              Save your brand voice for consistent content generation
            </p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Brand
          </button>
        </header>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
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
            <div className="card text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-background-tertiary mx-auto mb-4 flex items-center justify-center">
                <Palette className="w-8 h-8 text-foreground-muted" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchQuery ? 'No brands found' : 'No brand presets yet'}
              </h3>
              <p className="text-foreground-muted mb-4">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first brand preset to maintain consistent voice across all content'}
              </p>
              {!searchQuery && (
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Brand Preset
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrands.map((brand) => (
                <div key={brand.id} className="card group relative">
                  {brand.is_default && (
                    <div className="absolute top-4 right-12 flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      Default
                    </div>
                  )}

                  {/* Menu Button */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => setOpenMenuId(openMenuId === brand.id ? null : brand.id)}
                      className="p-1 rounded-lg hover:bg-background-tertiary text-foreground-muted hover:text-foreground transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {openMenuId === brand.id && (
                      <div className="absolute right-0 top-8 w-40 bg-background-secondary border border-border rounded-lg shadow-xl z-10">
                        <button
                          onClick={() => handleEdit(brand)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        {!brand.is_default && (
                          <button
                            onClick={() => handleSetDefault(brand.id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-background-tertiary transition-colors"
                          >
                            <Star className="w-4 h-4" />
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(brand.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-foreground mb-1">{brand.name}</h3>
                    {brand.description && (
                      <p className="text-sm text-foreground-muted line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${toneColors[brand.tone]}`}
                    >
                      {brand.tone}
                    </span>
                    {brand.use_emojis && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent">
                        Uses Emojis
                      </span>
                    )}
                  </div>

                  {brand.industry && (
                    <p className="text-xs text-foreground-muted mb-2">
                      <span className="font-medium">Industry:</span> {brand.industry}
                    </p>
                  )}

                  {brand.target_audience && (
                    <p className="text-xs text-foreground-muted mb-2">
                      <span className="font-medium">Audience:</span> {brand.target_audience}
                    </p>
                  )}

                  {brand.keywords && brand.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {brand.keywords.slice(0, 3).map((keyword, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-background-tertiary text-xs text-foreground-muted"
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
      </main>

      {/* Brand Modal */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingBrand={editingBrand}
        userId={user.id}
      />
    </div>
  );
}
