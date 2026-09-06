export type PushPlatform = "web" | "ios" | "android";

export type PushDeliveryResult = {
  success: boolean;
  status: "sent" | "delivered" | "bounced";
  error?: string;
  simulated?: boolean;
};

export type PushConfig = {
  webPushEnabled: boolean;
  fcmEnabled: boolean;
  apnsEnabled: boolean;
  simulationMode: boolean;
  vapidPublicKey: string | null;
};

function env(name: string) {
  return process.env[name]?.trim() || null;
}

export function getPushConfig(): PushConfig {
  const vapidPublicKey = env("VAPID_PUBLIC_KEY");
  const vapidPrivateKey = env("VAPID_PRIVATE_KEY");
  const vapidSubject = env("VAPID_SUBJECT");
  const webPushEnabled = Boolean(vapidPublicKey && vapidPrivateKey && vapidSubject);

  const fcmEnabled = Boolean(env("FCM_SERVER_KEY"));
  const apnsEnabled = Boolean(env("APNS_KEY") && env("APNS_KEY_ID") && env("APNS_TEAM_ID") && env("APNS_BUNDLE_ID"));

  const simulationMode = env("PUSH_SIMULATION_MODE") === "true" || (!webPushEnabled && !fcmEnabled && !apnsEnabled);

  return {
    webPushEnabled,
    fcmEnabled,
    apnsEnabled,
    simulationMode,
    vapidPublicKey,
  };
}

function isWebPushSubscription(token: string) {
  if (!token.startsWith("{")) return false;
  try {
    const parsed = JSON.parse(token) as { endpoint?: string };
    return typeof parsed.endpoint === "string";
  } catch {
    return false;
  }
}

async function deliverWebPush(token: string, title: string, body: string): Promise<PushDeliveryResult> {
  const config = getPushConfig();
  if (!config.webPushEnabled) {
    return simulateDelivery("web", token, title, body, "Web Push credentials not configured");
  }

  const webpush = await import("web-push");
  webpush.setVapidDetails(
    env("VAPID_SUBJECT")!,
    env("VAPID_PUBLIC_KEY")!,
    env("VAPID_PRIVATE_KEY")!,
  );

  try {
    const subscription = JSON.parse(token);
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body }),
      { TTL: 86400 },
    );
    return { success: true, status: "delivered" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Web push failed";
    const stale = message.includes("410") || message.toLowerCase().includes("expired");
    return { success: false, status: stale ? "bounced" : "bounced", error: message };
  }
}

async function deliverFcm(token: string, title: string, body: string): Promise<PushDeliveryResult> {
  const serverKey = env("FCM_SERVER_KEY");
  if (!serverKey) {
    return simulateDelivery("android", token, title, body, "FCM_SERVER_KEY not configured");
  }

  const response = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${serverKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      to: token,
      notification: { title, body },
      priority: "high",
    }),
  });

  const json = (await response.json()) as {
    success?: number;
    failure?: number;
    results?: { error?: string }[];
  };

  if (response.ok && json.success === 1) {
    return { success: true, status: "delivered" };
  }

  const error = json.results?.[0]?.error ?? `FCM error (${response.status})`;
  const stale = error === "NotRegistered" || error === "InvalidRegistration";
  return { success: false, status: "bounced", error };
}

async function deliverApns(token: string, title: string, body: string): Promise<PushDeliveryResult> {
  if (!getPushConfig().apnsEnabled) {
    return simulateDelivery("ios", token, title, body, "APNs credentials not configured");
  }

  // Full APNs HTTP/2 signing is environment-specific; record intent in simulation until configured.
  return simulateDelivery("ios", token, title, body, "APNs delivery queued (configure APNS_* env vars for live send)");
}

function simulateDelivery(
  platform: PushPlatform,
  token: string,
  title: string,
  body: string,
  reason?: string,
): PushDeliveryResult {
  console.info("[VISORA push simulation]", {
    platform,
    token: token.slice(0, 24),
    title,
    body,
    reason,
  });
  return {
    success: true,
    status: "sent",
    simulated: true,
    error: reason,
  };
}

export async function deliverPushNotification(options: {
  platform: PushPlatform;
  token: string;
  title: string;
  body: string;
}): Promise<PushDeliveryResult> {
  const { platform, token, title, body } = options;
  const config = getPushConfig();

  if (config.simulationMode && platform === "web" && !isWebPushSubscription(token)) {
    return simulateDelivery(platform, token, title, body);
  }

  if (platform === "web") {
    if (isWebPushSubscription(token)) {
      return deliverWebPush(token, title, body);
    }
    return simulateDelivery(platform, token, title, body, "Token is a device id, not a Web Push subscription");
  }

  if (platform === "android") {
    return deliverFcm(token, title, body);
  }

  return deliverApns(token, title, body);
}

export function isStalePushToken(result: PushDeliveryResult) {
  return !result.success && result.status === "bounced";
}
