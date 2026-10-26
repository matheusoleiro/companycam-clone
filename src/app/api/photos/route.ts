import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // TODO: Fix session persistence - skip auth for now
    const { data: { user } } = await supabase.auth.getUser();

    const projectId = request.nextUrl.searchParams.get('projectId');
    console.log('[GET /api/photos] projectId:', projectId);

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const { data: photos, error } = await supabase
      .from('photos')
      .select('*')
      .eq('project_id', projectId)
      .order('captured_at', { ascending: false });

    console.log('[GET /api/photos] result:', { count: photos?.length, error: error?.message });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Add public URLs to each photo
    const photosWithUrls = photos.map((photo: any) => {
      const { data: publicUrlData } = supabase.storage
        .from('photos')
        .getPublicUrl(photo.storage_path);
      console.log(`[GET /api/photos] Photo ${photo.id}:`, {
        storage_path: photo.storage_path,
        public_url: publicUrlData.publicUrl,
      });
      return {
        ...photo,
        public_url: publicUrlData.publicUrl,
      };
    });

    return NextResponse.json({ photos: photosWithUrls });
  } catch (error: any) {
    console.error('Get photos error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // TODO: Fix session persistence - skip auth for now
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const projectId = formData.get('projectId') as string;
    const latitude = formData.get('latitude') as string;
    const longitude = formData.get('longitude') as string;
    const capturedAt = formData.get('capturedAt') as string;

    if (!file || !projectId) {
      return NextResponse.json(
        { error: 'file and projectId are required' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${Date.now()}.${fileExt}`;
    const storagePath = `projects/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('photos')
      .upload(storagePath, Buffer.from(arrayBuffer), {
        contentType: file.type,
      });

    if (uploadError) {
      console.error('[POST /api/photos] Upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message },
        { status: 400 }
      );
    }

    // Create photo record
    const { data: photo, error: photoError } = await supabase
      .from('photos')
      .insert({
        project_id: projectId,
        uploaded_by_id: userId,
        storage_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        captured_at: capturedAt || new Date().toISOString(),
        is_video: file.type.startsWith('video/'),
        is_synced: true,
        is_pending_upload: false,
      })
      .select()
      .single();

    if (photoError) {
      return NextResponse.json(
        { error: photoError.message },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(storagePath);

    return NextResponse.json(
      {
        photo: {
          ...photo,
          public_url: publicUrlData.publicUrl,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Upload photo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();

    const photoId = request.nextUrl.searchParams.get('id');
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // Update photo
    const { data: photo, error } = await supabase
      .from('photos')
      .update({ name })
      .eq('id', photoId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(photo.storage_path);

    return NextResponse.json({
      photo: {
        ...photo,
        public_url: publicUrlData.publicUrl,
      },
    });
  } catch (error: any) {
    console.error('Update photo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // TODO: Fix session persistence - for now, use demo UUID
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const photoId = request.nextUrl.searchParams.get('id');
    if (!photoId) {
      return NextResponse.json(
        { error: 'Photo ID is required' },
        { status: 400 }
      );
    }

    // Get photo to find storage path and project
    const { data: photo, error: fetchError } = await supabase
      .from('photos')
      .select('storage_path, project_id')
      .eq('id', photoId)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('photos')
      .remove([photo.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue anyway - try to delete from DB
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('photos')
      .delete()
      .eq('id', photoId);

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete photo error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
