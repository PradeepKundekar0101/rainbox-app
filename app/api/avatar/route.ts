import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: userError?.message || "Not authenticated" },
        { status: 401 }
      );
    }

    const { data: userData, error: profileError } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    // Delete existing avatar if it exists
    if (userData?.avatar_url) {
      const oldFileName = userData.avatar_url.split("/").pop();
      if (oldFileName) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove([oldFileName]);

        if (deleteError) {
          console.error("Error deleting old avatar:", deleteError);
        }
      }
    }

    // Upload new avatar
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from("users")
      .update({
        avatar_url: publicUrl,
      })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      avatarUrl: publicUrl,
    });
  } catch (error: any) {
    console.error("Avatar upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
