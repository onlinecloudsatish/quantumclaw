/**
 * Session Store - Conversation memory management
 */

import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";

export interface Session {
  id: string;
  createdAt: number;
  messages: Array<{ role: string; content: string; timestamp: number }>;
  variables: Record<string, unknown>;
}

export class SessionStore {
  private sessions: Map<string, Session> = new Map();
  private storagePath: string;

  constructor() {
    this.storagePath = join(homedir(), ".newclaw", "sessions");
  }

  async initialize(): Promise<void> {
    await mkdir(this.storagePath, { recursive: true });
  }

  create(): Session {
    const session: Session = {
      id: `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
      messages: [],
      variables: {}
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(id: string): Session | undefined {
    return this.sessions.get(id);
  }

  addMessage(sessionId: string, role: string, content: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages.push({ role, content, timestamp: Date.now() });
    }
  }

  async save(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      await writeFile(join(this.storagePath, `${sessionId}.json`), JSON.stringify(session, null, 2));
    }
  }

  async load(sessionId: string): Promise<Session | null> {
    try {
      const data = await readFile(join(this.storagePath, `${sessionId}.json`), "utf-8");
      const session = JSON.parse(data) as Session;
      this.sessions.set(sessionId, session);
      return session;
    } catch {
      return null;
    }
  }
}
