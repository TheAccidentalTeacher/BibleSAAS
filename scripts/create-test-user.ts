/**
 * Creates a pre-confirmed test user in Supabase.
 * Run once: npx ts-node --project tsconfig.scripts.json scripts/create-test-user.ts
 */
import * as dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const EMAIL = "test@biblesaas.com";
const PASSWORD = "BibleTest2026!";

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Check if user already exists
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing?.users?.find((u) => u.email === EMAIL);
  if (found) {
    console.log(`✓ Test user already exists: ${EMAIL}`);
    console.log(`  ID: ${found.id}`);
    return;
  }

  // Create the user, pre-confirmed (no email verification needed)
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });

  if (error) {
    console.error("✗ Failed to create user:", error.message);
    process.exit(1);
  }

  console.log("✓ Test user created successfully!");
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  User ID:  ${data.user.id}`);
  console.log("");
  console.log("Login at: http://localhost:3000/auth/login");
}

main();
