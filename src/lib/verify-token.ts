import * as jose from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!;
const JWKS_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

// Cached remote JWK set — jose handles rotation automatically
const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URL));

/**
 * Verifies a Firebase ID token and returns the user's uid, or null if invalid.
 * Uses Google's public JWKs — no service account required.
 */
export async function verifyFirebaseToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}
