import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  try {
    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: authError?.message || "Not authenticated" },
        { status: 401 }
      );
    }

    // Delete sender
    const { error: deleteError } = await supabase
      .from("senders")
      .delete()
      .match({
        id: params.id,
        user_id: user.id, // Ensure user can only delete their own senders
      });

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Sender deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting sender:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
