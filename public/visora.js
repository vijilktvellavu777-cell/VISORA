"use strict";
var Visora = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // packages/visora-sdk/src/index.ts
  var index_exports = {};
  __export(index_exports, {
    Visora: () => Visora,
    default: () => index_default
  });
  var ANON_KEY = "visora_anonymous_id";
  var USER_KEY = "visora_user_id";
  var QUEUE_KEY = "visora_queue";
  function randomId(prefix) {
    const part = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "").slice(0, 16) : Math.random().toString(36).slice(2, 18);
    return `${prefix}_${part}`;
  }
  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
    }
  }
  function readQueue() {
    const raw = readStorage(QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
  function writeQueue(queue) {
    writeStorage(QUEUE_KEY, JSON.stringify(queue));
  }
  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i += 1) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  var VisoraClient = class {
    constructor() {
      this.apiKey = "";
      this.apiUrl = "";
      this.flushTimer = null;
      this.flushing = false;
    }
    init(options) {
      this.apiKey = options.apiKey;
      this.apiUrl = (options.apiUrl ?? "").replace(/\/$/, "");
      if (!this.apiKey) {
        throw new Error("VISORA SDK: apiKey is required");
      }
      if (!readStorage(ANON_KEY)) {
        writeStorage(ANON_KEY, randomId("anon"));
      }
      const interval = options.flushIntervalMs ?? 5e3;
      if (interval > 0) {
        this.flushTimer = setInterval(() => {
          void this.flush();
        }, interval);
      }
      void this.flush();
      if (options.autoRegisterDevice !== false) {
        void this.registerDevice({ platform: "web" });
      }
      if (options.enableWebPush) {
        void this.registerWebPush();
      }
    }
    async registerWebPush() {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
      const configResponse = await fetch(this.endpoint("/api/v1/push/config"));
      if (!configResponse.ok) return;
      const config = await configResponse.json();
      if (!config.enabled || !config.publicKey) return;
      const registration = await navigator.serviceWorker.register("/visora-sw.js");
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(config.publicKey)
      });
      writeStorage("visora_device_token", JSON.stringify(subscription));
      this.registerDevice({
        platform: "web",
        token: JSON.stringify(subscription)
      });
    }
    getAnonymousId() {
      return readStorage(ANON_KEY) ?? randomId("anon");
    }
    getUserId() {
      return readStorage(USER_KEY) ?? this.getAnonymousId();
    }
    identify(userId, traits) {
      writeStorage(USER_KEY, userId);
      this.enqueue({ type: "identify", userId, traits });
      void this.flush();
    }
    track(eventName, properties) {
      this.enqueue({ type: "track", eventName, properties });
      void this.flush();
    }
    registerDevice(options = {}) {
      this.enqueue({ type: "registerDevice", options });
      void this.flush();
    }
    async flush() {
      if (this.flushing || !this.apiKey) return;
      const queue = readQueue();
      if (queue.length === 0) return;
      this.flushing = true;
      const remaining = [];
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
    enqueue(call) {
      const queue = readQueue();
      queue.push(call);
      writeQueue(queue);
    }
    endpoint(path) {
      const base = this.apiUrl || (typeof window !== "undefined" ? window.location.origin : "");
      return `${base}${path}`;
    }
    async request(path, body) {
      const response = await fetch(this.endpoint(path), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        keepalive: true
      });
      if (!response.ok) {
        throw new Error(`VISORA SDK request failed: ${response.status}`);
      }
      return response.json();
    }
    async dispatch(call) {
      const anonymousId = this.getAnonymousId();
      const externalId = this.getUserId();
      if (call.type === "identify") {
        await this.request("/api/v1/users/identify", {
          external_id: call.userId,
          anonymous_id: anonymousId !== call.userId ? anonymousId : void 0,
          email: call.traits?.email,
          phone: call.traits?.phone,
          first_name: call.traits?.first_name,
          last_name: call.traits?.last_name,
          country: call.traits?.country,
          timezone: call.traits?.timezone,
          attributes: call.traits?.attributes
        });
        return;
      }
      if (call.type === "track") {
        await this.request("/api/v1/users/track", {
          external_id: externalId,
          events: [{ name: call.eventName, properties: call.properties ?? {} }]
        });
        return;
      }
      const platform = call.options.platform ?? "web";
      const token = call.options.token ?? readStorage("visora_device_token") ?? (() => {
        const generated = randomId("web_device");
        writeStorage("visora_device_token", generated);
        return generated;
      })();
      await this.request("/api/v1/devices/register", {
        external_id: externalId,
        platform,
        token,
        user_agent: call.options.userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : void 0)
      });
    }
  };
  var client = new VisoraClient();
  var Visora = {
    init: (options) => client.init(options),
    identify: (userId, traits) => client.identify(userId, traits),
    track: (eventName, properties) => client.track(eventName, properties),
    registerDevice: (options) => client.registerDevice(options),
    registerWebPush: () => client.registerWebPush(),
    getAnonymousId: () => client.getAnonymousId(),
    getUserId: () => client.getUserId(),
    flush: () => client.flush()
  };
  if (typeof window !== "undefined") {
    window.Visora = Visora;
  }
  var index_default = Visora;
  return __toCommonJS(index_exports);
})();
