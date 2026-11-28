import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { verifyAdminSession, unauthorizedResponse } from "@/lib/auth";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(request: Request) {
  if (!verifyAdminSession(request)) {
    return unauthorizedResponse();
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit" }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, WEBP, and GIF images are allowed." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Supabase Storage is configured, upload to storage bucket
    if (isSupabaseAdminConfigured && supabaseAdmin) {
      try {
        const rawExt = file.name.split(".").pop() || "png";
        const ext = rawExt.toLowerCase().replace(/[^a-z0-9]/g, "");
        const filename = `${folder.replace(/[^a-zA-Z0-9_-]/g, "")}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

        const { data, error } = await supabaseAdmin.storage
          .from("crunchify-assets")
          .upload(filename, buffer, {
            contentType: file.type || "image/png",
            upsert: true,
          });

        if (!error && data) {
          const { data: publicUrlData } = supabaseAdmin.storage
            .from("crunchify-assets")
            .getPublicUrl(filename);

          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
          });
        }
      } catch (e) {
        console.warn("Supabase storage upload failed, falling back to base64 URL:", e);
      }
    }

    // Fallback: Convert to base64 Data URL
    const mimeType = file.type || "image/png";
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "File upload failed" }, { status: 500 });
  }
}
