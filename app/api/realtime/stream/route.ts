import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/server-auth";
import { getRecentVaultEvents, subscribeVaultEvents } from "@/lib/realtime-bus";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();
  let cleanup: (() => void) | null = null;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (eventName: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Stream already closed
        }
      };

      send("connected", {
        userId: user.id,
        recent: getRecentVaultEvents(user.id).slice(0, 10),
        timestamp: new Date().toISOString(),
      });

      const unsubscribe = subscribeVaultEvents(user.id, (evt) => {
        send("vault", evt);
      });

      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 25000);

      cleanup = () => {
        unsubscribe();
        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      };

      request.signal.addEventListener("abort", () => {
        cleanup?.();
        try {
          controller.close();
        } catch {
          // Ignore close errors
        }
      });
    },
    cancel() {
      cleanup?.();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
