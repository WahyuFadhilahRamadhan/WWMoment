import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, isValidAdminCookie } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { PHOTOS_BUCKET, PHOTOS_TABLE } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  if (!isValidAdminCookie(request.cookies.get(ADMIN_COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const id = body?.id;
  if (typeof id !== "string" || !id) {
    return NextResponse.json(
      { error: "Missing photo id." },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: photo, error: fetchError } = await supabaseAdmin
    .from(PHOTOS_TABLE)
    .select("photo_url")
    .eq("id", id)
    .single();

  if (fetchError || !photo) {
    return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  }

  const marker = `/object/public/${PHOTOS_BUCKET}/`;
  const photoUrl = photo.photo_url as string;
  const markerIndex = photoUrl.indexOf(marker);
  if (markerIndex !== -1) {
    const storagePath = photoUrl.slice(markerIndex + marker.length);
    await supabaseAdmin.storage.from(PHOTOS_BUCKET).remove([storagePath]);
  }

  const { error: deleteError } = await supabaseAdmin
    .from(PHOTOS_TABLE)
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
