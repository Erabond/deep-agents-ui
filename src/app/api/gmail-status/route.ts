import { NextRequest } from "next/server";

/**
 * Returns whether a given uid has Gmail connected.
 * Server-side only — keeps API_BASE_URL private.
 */
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return Response.json({ connected: false }, { status: 400 });

  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) return Response.json({ connected: false }, { status: 500 });

  try {
    const res = await fetch(`${apiBase}/clients/${uid}`);
    if (!res.ok) return Response.json({ connected: false });
    const data = await res.json();
    return Response.json({ connected: !!data.gmail_token });
  } catch {
    return Response.json({ connected: false });
  }
}
