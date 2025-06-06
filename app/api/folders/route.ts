import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export const POST = async (request: Request) => {
  const supabase = await createClient();
  const body = await request.json();
  const { data, error } = await supabase
    .from("folders")
    .insert({
      name: body.name,
      user_id: body.user_id,
    })
    .select(); // Select the inserted item
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data[0]); // Return the first item from the array
};