import { NextResponse } from "next/server";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import { prisma } from "../../lib/db";

export async function POST(req: Request) {
  try {
    const { xml, id } = await req.json();

    // Lấy rule từ DB
    const result = await prisma.rule.findUnique({ where: { id } });
    const rules = result.map((r) => ({
      path: r.path,
      required: r.required,
      data_type: r.data_type,
      condition: r.condition,
    }));

    // Tạo file tạm
    const tmpDir = os.tmpdir();
    const xmlPath = path.join(tmpDir, `input_${Date.now()}.xml`);
    const rulePath = path.join(tmpDir, `rules_${Date.now()}.json`);
    fs.writeFileSync(xmlPath, xml);
    fs.writeFileSync(rulePath, JSON.stringify(rules, null, 2));

    const enginePath =
      "/Users/admin/Dev/tool/xml-validator/engine/target/release/xml-validator";
    // path.join(process.cwd(), "engine/target/release/xml_engine");
    const child = spawn(enginePath, [xmlPath, rulePath]);

    let output = "";
    let errorOutput = "";

    child.stdout.on("data", (data) => (output += data.toString()));
    child.stderr.on("data", (data) => (errorOutput += data.toString()));

    const exitCode: number = await new Promise((resolve) => {
      child.on("close", resolve);
    });

    if (exitCode !== 0) {
      console.error("Engine error:", errorOutput);
      return NextResponse.json({ error: "Validation failed" }, { status: 500 });
    }

    const resultJson = JSON.parse(output);
    return NextResponse.json(resultJson);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
