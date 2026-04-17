import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/verify-token";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const verifiedUid = await verifyFirebaseToken(auth.slice(7));
  if (!verifiedUid) {
    return Response.json({ error: "token_verification_failed" }, { status: 403 });
  }
  if (verifiedUid !== uid) {
    return Response.json({ error: "uid_mismatch" }, { status: 403 });
  }

  const body = await req.json();
  const upstream = await fetch(`${API_BASE_URL}/clients/${uid}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
