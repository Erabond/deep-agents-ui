/**
 * Temporary debug route — DELETE after fixing env vars.
 * Shows which private env vars are present on the server (values redacted).
 */
import { verifyFirebaseToken } from "@/lib/verify-token";

export async function GET(req: Request) {
  const authHeader = new Headers(req.headers).get("Authorization");
  let tokenCheck: string = "no token provided";

  if (authHeader?.startsWith("Bearer ")) {
    const uid = await verifyFirebaseToken(authHeader.slice(7));
    tokenCheck = uid ? `verified — uid: ${uid}` : "verification FAILED";
  }

  const vars = {
    API_BASE_URL: process.env.API_BASE_URL
      ? `set (${process.env.API_BASE_URL})`
      : "MISSING",
    LANGGRAPH_DEPLOYMENT_URL: process.env.LANGGRAPH_DEPLOYMENT_URL
      ? "set"
      : "MISSING",
    LANGGRAPH_ASSISTANT_ID: process.env.LANGGRAPH_ASSISTANT_ID
      ? `set (${process.env.LANGGRAPH_ASSISTANT_ID})`
      : "MISSING",
    LANGSMITH_API_KEY: process.env.LANGSMITH_API_KEY ? "set" : "MISSING",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      ? `set (${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID})`
      : "MISSING",
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY
      ? "set"
      : "MISSING",
    token_verification: tokenCheck,
  };

  return Response.json(vars);
}
