# SKILL: Real-Time Patterns

## Overview
Real-time data patterns for TypeScript/Next.js applications — WebSockets, Server-Sent Events (SSE), and polling strategies. Load when implementing notifications, live feeds, or collaborative features.

## Pattern Selection Guide
| Pattern | Use When | Pros | Cons |
|---|---|---|---|
| **SSE** | Server → Client only (notifications, live dashboards) | Simple, HTTP, auto-reconnect | One-way only |
| **WebSocket** | Bidirectional (chat, collab, gaming) | Full-duplex, low latency | Complex, stateful |
| **Polling** | Simple, infrequent updates | Dead simple, works everywhere | Latency, wasteful |
| **Long Polling** | Infrequent updates, need low latency | Simple fallback | Server holds connections |

## Server-Sent Events (SSE) — Most Common for Next.js
```typescript
// app/api/events/[userId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await auth();
  if (session?.user.id !== userId) return new Response('Unauthorized', { status: 401 });

  let notificationInterval: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        controller.enqueue(`event: ${event}\n`);
        controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      };

      // Send initial connection confirmation
      sendEvent('connected', { userId, timestamp: Date.now() });

      // Poll for new notifications every 3 seconds
      notificationInterval = setInterval(async () => {
        const notifications = await getNewNotifications(userId);
        if (notifications.length > 0) {
          sendEvent('notifications', notifications);
        }
      }, 3000);

      // Heartbeat to prevent proxy timeouts
      const heartbeat = setInterval(() => {
        controller.enqueue(':heartbeat\n\n');
      }, 25000);

      request.signal.addEventListener('abort', () => {
        clearInterval(notificationInterval);
        clearInterval(heartbeat);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',  // Disable nginx buffering
    },
  });
}
```

### SSE Client Hook
```typescript
// hooks/useServerEvents.ts
import { useEffect, useRef, useCallback } from 'react';

export function useServerEvents<T>(
  url: string,
  eventType: string,
  onMessage: (data: T) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    eventSourceRef.current?.close();
    const es = new EventSource(url);

    es.addEventListener(eventType, (e: MessageEvent) => {
      try {
        onMessage(JSON.parse(e.data) as T);
      } catch { /* ignore parse errors */ }
    });

    es.onerror = () => {
      es.close();
      // ✅ Auto-reconnect with exponential backoff
      setTimeout(connect, 3000);
    };

    eventSourceRef.current = es;
  }, [url, eventType, onMessage]);

  useEffect(() => {
    connect();
    return () => eventSourceRef.current?.close();
  }, [connect]);
}
```

## WebSocket with Pusher (Managed Solution)
```typescript
// ✅ Use Pusher/Ably for enterprise WebSockets — handles scaling
// lib/pusher.ts
import Pusher from 'pusher';
import PusherJS from 'pusher-js';

export const pusher = new Pusher({
  appId: process.env['PUSHER_APP_ID']!,
  key: process.env['NEXT_PUBLIC_PUSHER_KEY']!,
  secret: process.env['PUSHER_SECRET']!,
  cluster: 'us2',
  useTLS: true,
});

// Server: trigger an event
await pusher.trigger('private-user-123', 'message', { text: 'Hello!' });

// Client hook
export function useChannel(channelName: string, eventName: string, handler: (data: unknown) => void) {
  useEffect(() => {
    const pusherClient = new PusherJS(process.env['NEXT_PUBLIC_PUSHER_KEY']!, { cluster: 'us2' });
    const channel = pusherClient.subscribe(channelName);
    channel.bind(eventName, handler);
    return () => { channel.unbind(eventName, handler); pusherClient.unsubscribe(channelName); };
  }, [channelName, eventName, handler]);
}
```

## Optimistic UI with Real-Time Sync
```typescript
// Pattern: update UI immediately + confirm via real-time event
const sendMessage = useMutation({
  mutationFn: (text: string) => api.messages.create({ text }),
  onMutate: (text) => {
    // 1. Add message optimistically
    const tempId = `temp-${Date.now()}`;
    queryClient.setQueryData(['messages'], (prev: Message[]) => [
      ...prev,
      { id: tempId, text, sending: true, createdAt: new Date() },
    ]);
    return { tempId };
  },
  onSuccess: (realMessage, _, { tempId }) => {
    // 2. Replace temp message with real one on success
    queryClient.setQueryData(['messages'], (prev: Message[]) =>
      prev.map(m => m.id === tempId ? realMessage : m)
    );
  },
});
```
