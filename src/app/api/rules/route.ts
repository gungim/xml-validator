import { NextResponse } from "next/server";
import { prisma } from "../../lib/db";

export async function GET() {
  try {
    const result = await prisma.rule.findMany({ take: 10 });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch rules" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await prisma.rule.create({ data });
    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to insert rule" },
      { status: 500 },
    );
  }
}

// export async function DELETE(req: Request) {
//   try {
//     const { id } = await req.json();
//     await pool.query("DELETE FROM rules WHERE id = $1", [id]);
//     return NextResponse.json({ message: "Rule deleted" });
//   } catch (err) {
//     console.error(err);
//     return NextResponse.json(
//       { error: "Failed to delete rule" },
//       { status: 500 },
//     );
//   }
// }
