import { POST } from "../src/app/api/validate/[slug]/route";
import { prisma } from "../src/app/lib/db";
import { NextRequest } from "next/server";

async function main() {
  console.log("Setting up test data...");
  
  // Create a test project
  const slug = `test-slug-${Date.now()}`;
  const project = await prisma.project.create({
    data: {
      name: "Test Project",
      endpointSlug: slug,
      workspace: {
        create: {
          name: "Test Workspace",
        }
      }
    },
  });

  // Create a rule
  await prisma.rule.create({
    data: {
      name: "Test Rule",
      path: "root.child",
      dataType: "string",
      required: true,
      condition: { minLength: 3 },
      projectId: project.id,
    },
  });

  console.log(`Created project with slug: ${slug}`);

  // Test Valid Request
  console.log("\nTesting Valid Request...");
  const validUrl = `http://localhost:3000/api/validate/${slug}`;
  const validReq = new NextRequest(validUrl, {
    method: "POST",
    headers: {
      "x-api-key": project.endpointSecret,
    },
    body: JSON.stringify({
      xml: "<root><child>value</child></root>",
    }),
  });

  // Mock params
  const params = { params: { slug } };
  
  const validRes = await POST(validReq, params);
  const validData = await validRes.json();
  console.log("Valid Result:", validData);

  if (validRes.status === 200 && validData.isValid) {
    console.log("✅ Valid request passed");
  } else {
    console.error("❌ Valid request failed");
  }

  // Test Invalid Request (Wrong Slug)
  // Note: For the dynamic route, if the slug in URL doesn't match a project, it returns 404.
  // In a real server, the router handles this. Here we are calling the handler directly with a slug.
  // So we pass a wrong slug in params.
  
  console.log("\nTesting Invalid Slug...");
  const wrongSlug = "wrong-slug";
  const invalidUrl = `http://localhost:3000/api/validate/${wrongSlug}`;
  const invalidReq = new NextRequest(invalidUrl, {
    method: "POST",
    headers: {
      "x-api-key": project.endpointSecret,
    },
    body: JSON.stringify({
      xml: "<root><child>value</child></root>",
    }),
  });

  const invalidParams = { params: { slug: wrongSlug } };

  const invalidRes = await POST(invalidReq, invalidParams);
  const invalidData = await invalidRes.json();
  console.log("Invalid Result:", invalidData);

  if (invalidRes.status === 404) {
    console.log("✅ Invalid slug handled correctly");
  } else {
    console.error("❌ Invalid slug handling failed");
  }

  // Test Unauthorized (Wrong API Key)
  console.log("\nTesting Unauthorized...");
  const unauthorizedReq = new NextRequest(validUrl, {
    method: "POST",
    headers: {
      "x-api-key": "wrong-key",
    },
    body: JSON.stringify({
      xml: "<root><child>value</child></root>",
    }),
  });

  const unauthorizedRes = await POST(unauthorizedReq, params);
  const unauthorizedData = await unauthorizedRes.json();
  console.log("Unauthorized Result:", unauthorizedData);

  if (unauthorizedRes.status === 401) {
    console.log("✅ Unauthorized handled correctly");
  } else {
    console.error("❌ Unauthorized handling failed");
  }

  // Cleanup
  console.log("\nCleaning up...");
  await prisma.rule.deleteMany({ where: { projectId: project.id } });
  await prisma.project.delete({ where: { id: project.id } });
  await prisma.workspace.delete({ where: { id: project.workspaceId } });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
