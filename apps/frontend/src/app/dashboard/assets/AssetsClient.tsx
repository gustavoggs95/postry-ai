'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase/client';

interface MediaAsset {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  thumbnail_path: string | null;
  transcription: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface Brand {
  id: string;
  name: string;
  voice_tone: string;
}

interface AssetsClientProps {
  initialAssets: MediaAsset[];
  brands: Brand[];
}

export default function AssetsClient({ initialAssets, brands }: AssetsClientProps) {
  const supabase = createBrowserClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{
    tweets: string[];
    blogOutline: string;
    reelsIdeas: string[];
  } | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>(brands[0]?.id || '');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'audio/mpeg', 'audio/wav', 'audio/mp3'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid video or audio file (MP4, WebM, MOV, MP3, WAV)');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 100MB');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `${user.id}/${timestamp}_${sanitizedName}`;

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('media-assets')
        .upload(storagePath, file);

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(95);

      // Create database record
      const { data: assetData, error: dbError } = await supabase
        .from('media_assets')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: uploadData.path,
          metadata: {
            original_name: file.name,
            uploaded_at: new Date().toISOString(),
          }
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setUploadProgress(100);
      setAssets(prev => [assetData, ...prev]);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleTranscribe = async (asset: MediaAsset) => {
    setTranscribing(true);
    setSelectedAsset(asset);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assets/${asset.id}/transcribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Transcription failed');

      const data = await response.json();

      // Update local state
      setAssets(prev => prev.map(a => 
        a.id === asset.id ? { ...a, transcription: data.transcription } : a
      ));
      setSelectedAsset({ ...asset, transcription: data.transcription });

    } catch (error) {
      console.error('Transcription error:', error);
      alert('Failed to transcribe. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!selectedAsset?.transcription) {
      alert('Please transcribe the asset first');
      return;
    }

    setGenerating(true);
    setGeneratedContent(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/assets/${selectedAsset.id}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandId: selectedBrand,
          formats: ['tweets', 'blog', 'reels'],
        }),
      });

      if (!response.ok) throw new Error('Content generation failed');

      const data = await response.json();
      setGeneratedContent(data.content);

    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      // Delete from storage
      await supabase.storage
        .from('media-assets')
        .remove([asset.storage_path]);

      // Delete from database
      await supabase
        .from('media_assets')
        .delete()
        .eq('id', asset.id);

      setAssets(prev => prev.filter(a => a.id !== asset.id));
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
        setGeneratedContent(null);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete asset.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('video/')) {
      return (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Asset Transformation</h1>
          <p className="text-gray-400 mt-1">Upload videos and audio to repurpose into multi-format content</p>
        </div>
        <Link
          href="/dashboard"
          className="px-4 py-2 bg-surface-light text-gray-300 rounded-lg hover:bg-surface-light/80 transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload & Assets List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload Card */}
          <div className="bg-surface rounded-xl p-6 border border-gray-800">
            <h2 className="text-lg font-semibold text-white mb-4">Upload Media</h2>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-primary transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
                  <p className="text-gray-400">Uploading... {uploadProgress}%</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 mx-auto text-gray-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-400">Click to upload video or audio</p>
                  <p className="text-gray-500 text-sm mt-1">MP4, WebM, MOV, MP3, WAV (max 100MB)</p>
                </>
              )}
            </button>
          </div>

          {/* Assets List */}
          <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
            <div className="p-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Your Assets</h2>
            </div>
            
            {assets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p>No assets yet</p>
                <p className="text-sm">Upload your first video or audio file</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800 max-h-96 overflow-y-auto">
                {assets.map((asset) => (
                  <div
                    key={asset.id}
                    className={`p-4 cursor-pointer hover:bg-surface-light transition-colors ${
                      selectedAsset?.id === asset.id ? 'bg-surface-light border-l-2 border-primary' : ''
                    }`}
                    onClick={() => {
                      setSelectedAsset(asset);
                      setGeneratedContent(null);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-gray-400">
                        {getFileIcon(asset.file_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{asset.filename}</p>
                        <p className="text-gray-500 text-sm">
                          {formatFileSize(asset.file_size)} • {new Date(asset.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {asset.transcription ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/20 text-green-400">
                              Transcribed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/20 text-yellow-400">
                              Not transcribed
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(asset);
                        }}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Asset Detail & Content Generation */}
        <div className="lg:col-span-2 space-y-6">
          {selectedAsset ? (
            <>
              {/* Asset Detail Card */}
              <div className="bg-surface rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Asset Details</h2>
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                    {selectedAsset.file_type.split('/')[0].toUpperCase()}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-400 text-sm">Filename</p>
                    <p className="text-white">{selectedAsset.filename}</p>
                  </div>

                  {/* Transcription Section */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-400 text-sm">Transcription</p>
                      {!selectedAsset.transcription && (
                        <button
                          onClick={() => handleTranscribe(selectedAsset)}
                          disabled={transcribing}
                          className="px-3 py-1 bg-accent text-black text-sm font-medium rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                        >
                          {transcribing ? 'Transcribing...' : 'Transcribe with AI'}
                        </button>
                      )}
                    </div>
                    {selectedAsset.transcription ? (
                      <div className="bg-surface-light rounded-lg p-4 max-h-48 overflow-y-auto">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">
                          {selectedAsset.transcription}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-surface-light rounded-lg p-4 text-center">
                        {transcribing ? (
                          <div className="flex items-center justify-center gap-2 text-gray-400">
                            <div className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                            <span>Transcribing audio...</span>
                          </div>
                        ) : (
                          <p className="text-gray-500">
                            Click &quot;Transcribe with AI&quot; to extract text from this {selectedAsset.file_type.split('/')[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Generation Card */}
              <div className="bg-surface rounded-xl p-6 border border-gray-800">
                <h2 className="text-lg font-semibold text-white mb-4">Generate Multi-Format Content</h2>

                {selectedAsset.transcription ? (
                  <div className="space-y-4">
                    {/* Brand Selection */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Brand Voice</label>
                      <select
                        value={selectedBrand}
                        onChange={(e) => setSelectedBrand(e.target.value)}
                        className="w-full px-4 py-2 bg-surface-light border border-gray-700 rounded-lg text-white focus:border-primary focus:outline-none"
                      >
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name} - {brand.voice_tone}
                          </option>
                        ))}
                        {brands.length === 0 && (
                          <option value="">No brands - Create one first</option>
                        )}
                      </select>
                    </div>

                    {/* Generate Button */}
                    <button
                      onClick={handleGenerateContent}
                      disabled={generating || !selectedBrand}
                      className="w-full px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {generating ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                          Generating Content...
                        </span>
                      ) : (
                        'Generate Tweets, Blog Outline & Reels Ideas'
                      )}
                    </button>

                    {/* Generated Content */}
                    {generatedContent && (
                      <div className="space-y-6 mt-6">
                        {/* Tweets */}
                        <div>
                          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                            Twitter Threads
                          </h3>
                          <div className="space-y-2">
                            {generatedContent.tweets.map((tweet, index) => (
                              <div key={index} className="bg-surface-light rounded-lg p-4">
                                <p className="text-gray-300 text-sm">{index + 1}. {tweet}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Blog Outline */}
                        <div>
                          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Blog Outline
                          </h3>
                          <div className="bg-surface-light rounded-lg p-4">
                            <p className="text-gray-300 text-sm whitespace-pre-wrap">{generatedContent.blogOutline}</p>
                          </div>
                        </div>

                        {/* Reels Ideas */}
                        <div>
                          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                            </svg>
                            Instagram Reels Ideas
                          </h3>
                          <div className="space-y-2">
                            {generatedContent.reelsIdeas.map((idea, index) => (
                              <div key={index} className="bg-surface-light rounded-lg p-4">
                                <p className="text-gray-300 text-sm">{index + 1}. {idea}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <p>Transcribe the asset first to generate content</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-surface rounded-xl p-12 border border-gray-800 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Select an Asset</h3>
              <p className="text-gray-500">
                Choose a video or audio file from the list to transcribe and generate content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
