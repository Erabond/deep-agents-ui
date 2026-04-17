import { NextRequest } from "next/server";

/**
 * Redirects the browser to the FastAPI Gmail OAuth flow.
 * Keeps API_BASE_URL private — the browser never sees it.
 */
export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return new Response("Missing uid", { status: 400 });

  const target = `${process.env.API_BASE_URL}/auth/google?uid=${encodeURIComponent(uid)}`;
  return Response.redirect(target);
}
