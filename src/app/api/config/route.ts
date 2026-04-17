import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/verify-token";

/**
 * Returns server-side config values to authenticated users.
 * Keeps LANGGRAPH_ASSISTANT_ID private — never exposed in the browser bundle.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const uid = await verifyFirebaseToken(auth.slice(7));
  if (!uid) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    assistantId: process.env.LANGGRAPH_ASSISTANT_ID ?? "agent",
  });
}
