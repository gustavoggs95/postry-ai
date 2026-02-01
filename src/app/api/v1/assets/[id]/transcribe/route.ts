import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { openai } from '@/lib/openai';

// POST /api/v1/assets/:id/transcribe - Transcribe asset
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;

    // Get asset
    const { data: asset, error: assetError } = await supabaseAdmin
      .from('media_assets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Check if already transcribed
    if (asset.transcription) {
      return NextResponse.json({ transcription: asset.transcription });
    }

    // Limit: 5 transcriptions per user per month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const { count: transcriptionCount, error: countError } = await supabaseAdmin
      .from('media_assets')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .not('transcription', 'is', null)
      .gte('created_at', startOfMonth.toISOString())
      .lt('created_at', endOfMonth.toISOString());

    if (countError) {
      return NextResponse.json({ error: 'Failed to check usage limit' }, { status: 500 });
    }
    if ((transcriptionCount ?? 0) >= 5) {
      return NextResponse.json(
        { error: 'Monthly transcription limit reached (5 per month)' },
        { status: 429 }
      );
    }

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from('postry-bucket')
      .download(asset.storage_path);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Convert blob to File for OpenAI
    const file = new File([fileData], asset.file_name, { type: asset.file_type });

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en',
      response_format: 'text',
    });

    // Save transcription
    const { error: updateError } = await supabaseAdmin
      .from('media_assets')
      .update({ transcription })
      .eq('id', id);

    if (updateError) {
      console.error('Failed to save transcription:', updateError);
    }

    return NextResponse.json({ transcription });
  } catch (error) {
    console.error('Error transcribing asset:', error);
    return NextResponse.json({ error: 'Failed to transcribe asset' }, { status: 500 });
  }
}
