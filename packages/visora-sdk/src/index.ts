export type VisoraInitOptions = {
  apiKey: string;
  apiUrl?: string;
  /** Automatically register this browser as a web device on init */
  autoRegisterDevice?: boolean;
  /** Flush queued calls on a timer (ms). Default 5000. Set 0 to disable. */
  flushIntervalMs?: number;
};

export type VisoraIdentifyTraits = {
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  country?: string;
  timezone?: string;
  attributes?: Record<string, unknown>;
};

export type VisoraTrackProperties = Record<string, unknown>;

export type VisoraRegisterDeviceOptions = {
  platform?: "web" | "ios" | "android";
  token?: string;
  userAgent?: string;
};

type QueuedCall =
  | { type: "identify"; userId: string; traits?: VisoraIdentifyTraits }
  | { type: "track"; eventName: string; properties?: VisoraTrackProperties }
  | { type: "registerDevice"; options: VisoraRegisterDeviceOptions };

const ANON_KEY = "visora_anonymous_id";
const USER_KEY = "visora_user_id";
const QUEUE_KEY = "visora_queue";

function randomId(prefix: string) {
  const part = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
    : Math.random().toString(36).slice(2, 18);
  return `${prefix}_${part}`;
}

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore quota / private mode
  }
}

function readQueue(): QueuedCall[] {
  const raw = readStorage(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedCall[];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedCall[]) {
  writeStorage(QUEUE_KEY, JSON.stringify(queue));
}

class VisoraClient {
  private apiKey = "";
  private apiUrl = "";
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private flushing = false;

  init(options: VisoraInitOptions) {
    this.apiKey = options.apiKey;
    this.apiUrl = (options.apiUrl ?? "").replace(/\/$/, "");
    if (!this.apiKey) {
      throw new Error("VISORA SDK: apiKey is required");
    }

    if (!readStorage(ANON_KEY)) {
      writeStorage(ANON_KEY, randomId("anon"));
    }

    const interval = options.flushIntervalMs ?? 5000;
    if (interval > 0) {
      this.flushTimer = setInterval(() => {
        void this.flush();
      }, interval);
    }

    void this.flush();

    if (options.autoRegisterDevice !== false) {
      void this.registerDevice({ platform: "web" });
    }
  }

  getAnonymousId() {
    return readStorage(ANON_KEY) ?? randomId("anon");
  }

  getUserId() {
    return readStorage(USER_KEY) ?? this.getAnonymousId();
  }

  identify(userId: string, traits?: VisoraIdentifyTraits) {
    writeStorage(USER_KEY, userId);
    this.enqueue({ type: "identify", userId, traits });
    void this.flush();
  }

  track(eventName: string, properties?: VisoraTrackProperties) {
    this.enqueue({ type: "track", eventName, properties });
    void this.flush();
  }

  registerDevice(options: VisoraRegisterDeviceOptions = {}) {
    this.enqueue({ type: "registerDevice", options });
    void this.flush();
  }

  async flush() {
    if (this.flushing || !this.apiKey) return;
    const queue = readQueue();
    if (queue.length === 0) return;

    this.flushing = true;
    const remaining: QueuedCall[] = [];

    for (const call of queue) {
      try {
        await this.dispatch(call);
      } catch {
        remaining.push(call);
      }
    }

    writeQueue(remaining);
    this.flushing = false;
  }

  private enqueue(call: QueuedCall) {
    const queue = readQueue();
    queue.push(call);
    writeQueue(queue);
  }

  private endpoint(path: string) {
    const base = this.apiUrl || (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}${path}`;
  }

  private async request(path: string, body: unknown) {
    const response = await fetch(this.endpoint(path), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
    if (!response.ok) {
      throw new Error(`VISORA SDK request failed: ${response.status}`);
    }
    return response.json();
  }

  private async dispatch(call: QueuedCall) {
    const anonymousId = this.getAnonymousId();
    const externalId = this.getUserId();

    if (call.type === "identify") {
      await this.request("/api/v1/users/identify", {
        external_id: call.userId,
        anonymous_id: anonymousId !== call.userId ? anonymousId : undefined,
        email: call.traits?.email,
        phone: call.traits?.phone,
        first_name: call.traits?.first_name,
        last_name: call.traits?.last_name,
        country: call.traits?.country,
        timezone: call.traits?.timezone,
        attributes: call.traits?.attributes,
      });
      return;
    }

    if (call.type === "track") {
      await this.request("/api/v1/users/track", {
        external_id: externalId,
        events: [{ name: call.eventName, properties: call.properties ?? {} }],
      });
      return;
    }

    const platform = call.options.platform ?? "web";
    const token =
      call.options.token ??
      readStorage("visora_device_token") ??
      (() => {
        const generated = randomId("web_device");
        writeStorage("visora_device_token", generated);
        return generated;
      })();

    await this.request("/api/v1/devices/register", {
      external_id: externalId,
      platform,
      token,
      user_agent: call.options.userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
    });
  }
}

const client = new VisoraClient();

export const Visora = {
  init: (options: VisoraInitOptions) => client.init(options),
  identify: (userId: string, traits?: VisoraIdentifyTraits) => client.identify(userId, traits),
  track: (eventName: string, properties?: VisoraTrackProperties) => client.track(eventName, properties),
  registerDevice: (options?: VisoraRegisterDeviceOptions) => client.registerDevice(options),
  getAnonymousId: () => client.getAnonymousId(),
  getUserId: () => client.getUserId(),
  flush: () => client.flush(),
};

declare global {
  interface Window {
    Visora?: typeof Visora;
  }
}

if (typeof window !== "undefined") {
  window.Visora = Visora;
}

export default Visora;
