import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { AddSenderRequest } from "@/types/data";

export async function POST(request: Request) {
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

    // Parse and validate request body
    const body: AddSenderRequest = await request.json();

    if (!body.email || !body.name) {
      return NextResponse.json(
        { error: "email and name are required" },
        { status: 400 }
      );
    }

    // Extract domain from email if not provided
    const domain = body.domain || body.email.split("@")[1];

    // Insert sender
    const { data: sender, error: insertError } = await supabase
      .from("senders")
      .upsert({
        user_id: user.id,
        name: body.name,
        email: body.email,
        domain,
        mail_service: "gmail",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        data: sender,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error adding sender:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
