import { Elysia, status } from "elysia";
import { auth } from "@/auth";

const sessionCache = new Map<string, { data: any; expires: number }>();
const SESSION_CACHE_TTL = 5000; // 5 seconds

function getSessionToken(headers: Headers): string | null {
    const cookie = headers.get("cookie");
    if (!cookie) return null;
    const match = cookie.match(/better-auth\.session_token=([^;]+)/);
    return match ? match[1] : null;
}

const betterAuthMiddleware = new Elysia({ name: "better-auth" }).mount(auth.handler).macro({
    auth: {
        async resolve({ request: { headers } }) {
            const token = getSessionToken(headers);
            if (token) {
                const cached = sessionCache.get(token);
                if (cached && Date.now() < cached.expires) {
                    return {
                        user: cached.data.user,
                        session: cached.data.session,
                    };
                }
            }

            const session = await auth.api.getSession({
                headers,
            });

            if (!session) return status(401);

            if (token) {
                sessionCache.set(token, {
                    data: session,
                    expires: Date.now() + SESSION_CACHE_TTL,
                });

                // Evict stale entries periodically
                if (sessionCache.size > 100) {
                    const now = Date.now();
                    for (const [k, v] of sessionCache) {
                        if (now > v.expires) sessionCache.delete(k);
                    }
                }
            }

            return {
                user: session.user,
                session: session.session,
            };
        },
    },
});

export default betterAuthMiddleware;
