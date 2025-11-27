import bcrypt from "bcryptjs";

async function generateHash() {
  const password = "admin123";
  const hash = await bcrypt.hash(password, 10);
  
  console.log("\n=== SQL Script để tạo Admin User ===\n");
  console.log(`INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")`);
  console.log(`VALUES (`);
  console.log(`  gen_random_uuid()::text,`);
  console.log(`  'Admin User',`);
  console.log(`  'admin@example.com',`);
  console.log(`  '${hash}',`);
  console.log(`  'ADMIN',`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`)`);
  console.log(`ON CONFLICT (email)`);
  console.log(`DO UPDATE SET`);
  console.log(`  password = EXCLUDED.password,`);
  console.log(`  role = EXCLUDED.role,`);
  console.log(`  "updatedAt" = NOW();`);
  console.log("\n");
}

generateHash();
