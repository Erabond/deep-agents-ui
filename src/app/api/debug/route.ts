/**
 * Temporary debug route — DELETE after fixing env vars.
 * Shows which private env vars are present on the server (values redacted).
 */
export async function GET() {
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
  };

  return Response.json(vars);
}
