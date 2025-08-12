import { getFeeConfig } from "@/app/api/utils/fees";

export async function GET() {
  const fees = await getFeeConfig();
  return Response.json({ ok: true, fees });
}


