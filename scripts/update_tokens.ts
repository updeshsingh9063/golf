import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  const { data: hats, error: fetchError } = await supabaseAdmin
    .from("hats")
    .select("id, number, qr_token");

  if (fetchError) {
    console.error("Error fetching hats:", fetchError);
    return;
  }

  let updatedCount = 0;
  for (const hat of hats) {
    if (!hat.qr_token) {
      const token = crypto.randomBytes(16).toString("hex");
      const { error: updateError } = await supabaseAdmin
        .from("hats")
        .update({ qr_token: token })
        .eq("id", hat.id);

      if (updateError) {
        console.error(`Error updating hat ${hat.number}:`, updateError);
      } else {
        updatedCount++;
        console.log(`Updated hat ${hat.number} with token ${token}`);
      }
    }
  }
  
  console.log(`Updated ${updatedCount} hats.`);
}

main();
