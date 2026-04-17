import { NextRequest, NextResponse } from "next/server";

/**
 * Redirects the browser to the FastAPI Gmail OAuth flow.
 * Keeps API_BASE_URL private — the browser never sees it.
 */
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return new Response("Missing uid", { status: 400 });

  const apiBase = process.env.API_BASE_URL;
  if (!apiBase) {
    return new Response("API_BASE_URL env var is not set", { status: 500 });
  }

  const target = `${apiBase}/auth/google?uid=${encodeURIComponent(uid)}`;
  return NextResponse.redirect(target);
}
