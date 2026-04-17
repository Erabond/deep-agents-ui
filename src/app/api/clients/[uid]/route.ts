import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/verify-token";

const API_BASE_URL = process.env.API_BASE_URL!;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> }
) {
  const { uid } = await params;

  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const verifiedUid = await verifyFirebaseToken(auth.slice(7));
  // Must be authenticated AND the token must match the requested uid
  if (!verifiedUid || verifiedUid !== uid) {
    return new Response("Forbidden", { status: 403 });
  }

  const upstream = await fetch(`${API_BASE_URL}/clients/${uid}`);
  const data = await upstream.json();
  return Response.json(data, { status: upstream.status });
}
