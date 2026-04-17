import { NextRequest } from "next/server";
import { verifyFirebaseToken } from "@/lib/verify-token";

const LANGGRAPH_URL = process.env.LANGGRAPH_DEPLOYMENT_URL!.replace(/\/$/, "");
const API_KEY = process.env.LANGSMITH_API_KEY!;

async function authenticate(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  return verifyFirebaseToken(auth.slice(7));
}

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const uid = await authenticate(req);
  if (!uid) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const targetUrl = `${LANGGRAPH_URL}/${path.join("/")}${url.search}`;

  const headers: Record<string, string> = { "X-Api-Key": API_KEY };
  const contentType = req.headers.get("Content-Type");
  if (contentType) headers["Content-Type"] = contentType;

  let body: BodyInit | null = null;
  const hasBody = req.method !== "GET" && req.method !== "HEAD";

  if (hasBody) {
    if (contentType?.includes("application/json")) {
      try {
        const json = await req.json();
        // Inject the server-verified uid so clients can't spoof it
        if (json?.config?.configurable !== undefined) {
          json.config.configurable.uid = uid;
        }
        body = JSON.stringify(json);
      } catch {
        body = req.body;
      }
    } else {
      body = req.body;
    }
  }

  const fetchInit: RequestInit & { duplex?: string } = {
    method: req.method,
    headers,
    body,
  };
  // duplex is required by Node.js when the request body is a ReadableStream
  if (body !== null && body === req.body) fetchInit.duplex = "half";

  const upstream = await fetch(targetUrl, fetchInit as RequestInit);

  // Forward response headers, skipping ones Next.js manages itself
  const responseHeaders: Record<string, string> = {};
  upstream.headers.forEach((value, key) => {
    if (!["content-encoding", "transfer-encoding"].includes(key.toLowerCase())) {
      responseHeaders[key] = value;
    }
  });

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return proxy(req, (await params).path);
}
