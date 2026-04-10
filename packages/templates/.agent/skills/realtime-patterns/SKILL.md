---
name: realtime-patterns
description: "Hardened strategies for Real-time Communication in TypeScript applications. Focuses on WebSockets, SSE (Server-Sent Events), and Optimistic Sync."
---

# SKILL: Enterprise Real-time Patterns

## Overview
Hardened strategies for **Real-time Communication** in TypeScript applications. Focuses on **WebSockets**, **SSE (Server-Sent Events)**, and **Optimistic Sync**.

## 1. WebSockets vs SSE (The Decision)
Choose the right tool for the job.
- **SSE**: Best for one-way server-to-client updates (e.g., Progress bars, Notifications, Log streams). Simpler and follows standard HTTP.
- **WebSockets**: Mandatory for two-way, low-latency interactions (e.g., Multiplayer editors, Real-time chat, Games).

## 2. Reconnection & Resilience
Network drops are inevitable.
- **Exponential Backoff**: Clients must retry connections with increasing delays.
- **State Reconciliation**: On reconnection, the client must "catch up" by fetching the latest state or missed events from the DB.

## 3. Scaling: The Pub/Sub Layer
A single server cannot handle 1M WebSocket connections.
- **Protocol**: Use **Redis Pub/Sub** or **Socket.io Redis Adapter** to broadcast messages across multiple server instances.
- **Statelessness**: Ensure WebSocket servers remain stateless; all user data goes into the primary DB.

## 4. Security: Origin & Auth Validation
- **Auth**: Always validate the user's JWT during the initial handshake.
- **CORS**: Strictly define allowed origins to prevent "Cross-Site WebSocket Hijacking".

## 5. Optimistic Updates & Conflict Resolution
- **Optimism**: Update the UI immediately on the sender's side.
- **Reconciliation**: If the server rejects the message, use **Rollback** logic in the client to revert the UI.

## Skills to Load
- `websockets-ws-socketio`
- `server-sent-events-sse`
- `realtime-synchronization`
- `redis-pub-sub-scaling`
