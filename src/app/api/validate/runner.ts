import { spawn } from "child_process";
import { promises as fs } from "fs";
import os from "os";
import path from "path";

import { prisma } from "@/src/app/lib/db";

const ENGINE_PATH =
  process.env.XML_ENGINE_PATH ??
  path.resolve(process.cwd(), "../engine/target/release/xml-validator");

export async function runProjectValidation(projectId: string, xml: string) {
  const rules = await prisma.rule.findMany({
    where: { projectId },
    select: {
      path: true,
      required: true,
      dataType: true,
      condition: true,
    },
  });

  if (rules.length === 0) {
    throw new Error("No rules configured for this project");
  }

  const formattedRules = rules.map((rule) => ({
    path: rule.path,
    required: rule.required,
    data_type: rule.dataType,
    condition: rule.condition ?? {},
  }));

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "xmlv-"));
  const xmlPath = path.join(tmpDir, "input.xml");
  const rulePath = path.join(tmpDir, "rules.json");

  await fs.writeFile(xmlPath, xml);
  await fs.writeFile(rulePath, JSON.stringify(formattedRules, null, 2));

  try {
    const output = await executeEngine(xmlPath, rulePath);
    return JSON.parse(output);
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
}

function executeEngine(xmlPath: string, rulePath: string) {
  return new Promise<string>((resolve, reject) => {
    const child = spawn(ENGINE_PATH, [xmlPath, rulePath]);
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(stderr || "Validation engine failed with unknown error"),
        );
      }
      resolve(stdout);
    });
  });
}

