import prisma from "@/utils/prisma";

export async function GET() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`;
    console.log("✅ DB connection works:", result);
    return new Response("DB connected", { status: 200 });
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    return new Response("DB connection failed", { status: 500 });
  }
}
