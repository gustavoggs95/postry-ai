import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser, unauthorizedResponse } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

// DELETE /api/v1/assets/:id - Delete asset
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await getAuthenticatedUser(request);
  if (error || !user) {
    return unauthorizedResponse(error || undefined);
  }

  try {
    const { id } = await params;

    // Get asset to find storage path
    const { data: asset, error: assetError } = await supabaseAdmin
      .from('media_assets')
      .select('storage_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (assetError || !asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // Delete from storage
    await supabaseAdmin.storage.from('postry-bucket').remove([asset.storage_path]);

    // Delete from database
    const { error: deleteError } = await supabaseAdmin.from('media_assets').delete().eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
  }
}
