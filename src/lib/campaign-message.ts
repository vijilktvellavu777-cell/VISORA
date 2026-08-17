export type PushPlatform = "ios" | "android" | "web";

export const PUSH_PLATFORMS: {
  id: PushPlatform;
  label: string;
  description: string;
}[] = [
  { id: "ios", label: "iOS", description: "Send via Apple Push Notification service" },
  { id: "android", label: "Android", description: "Send via Firebase Cloud Messaging" },
  { id: "web", label: "Web", description: "Send via web push notifications" },
];

export type PushMessagePayload = {
  title: string;
  message: string;
  platforms: PushPlatform[];
};

export type InAppMessagePayload = {
  title: string;
  message: string;
  buttonText: string;
  buttonUrl: string;
};

const DEFAULT_PUSH_PLATFORMS: PushPlatform[] = ["ios", "android", "web"];

export function defaultPushMessage(): PushMessagePayload {
  return {
    title: "",
    message: "",
    platforms: [...DEFAULT_PUSH_PLATFORMS],
  };
}

export function defaultInAppMessage(): InAppMessagePayload {
  return {
    title: "",
    message: "",
    buttonText: "",
    buttonUrl: "",
  };
}

export function parsePushPayload(subject: string | null, body: string): PushMessagePayload {
  const title = subject?.trim() ?? "";
  if (!body.trim()) {
    return { title, message: "", platforms: [...DEFAULT_PUSH_PLATFORMS] };
  }

  try {
    const parsed = JSON.parse(body) as Partial<PushMessagePayload>;
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.platforms)) {
      return {
        title,
        message: typeof parsed.message === "string" ? parsed.message : body,
        platforms: parsed.platforms.filter((platform): platform is PushPlatform =>
          DEFAULT_PUSH_PLATFORMS.includes(platform as PushPlatform),
        ),
      };
    }
  } catch {
    // Plain text body fallback
  }

  return {
    title,
    message: body,
    platforms: [...DEFAULT_PUSH_PLATFORMS],
  };
}

export function serializePushPayload(payload: PushMessagePayload) {
  return {
    subject: payload.title,
    body: JSON.stringify({
      message: payload.message,
      platforms: payload.platforms,
    }),
  };
}

export function parseInAppPayload(subject: string | null, body: string): InAppMessagePayload {
  const title = subject?.trim() ?? "";
  if (!body.trim()) {
    return { ...defaultInAppMessage(), title };
  }

  try {
    const parsed = JSON.parse(body) as Partial<InAppMessagePayload>;
    if (parsed && typeof parsed === "object" && typeof parsed.message === "string") {
      return {
        title: typeof parsed.title === "string" && parsed.title ? parsed.title : title,
        message: parsed.message,
        buttonText: typeof parsed.buttonText === "string" ? parsed.buttonText : "",
        buttonUrl: typeof parsed.buttonUrl === "string" ? parsed.buttonUrl : "",
      };
    }
  } catch {
    // Plain text body fallback
  }

  return {
    title,
    message: body,
    buttonText: "",
    buttonUrl: "",
  };
}

export function serializeInAppPayload(payload: InAppMessagePayload) {
  return {
    subject: payload.title,
    body: JSON.stringify({
      title: payload.title,
      message: payload.message,
      buttonText: payload.buttonText,
      buttonUrl: payload.buttonUrl,
    }),
  };
}

export function pushPlatformLabels(platforms: PushPlatform[]) {
  return platforms
    .map((platform) => PUSH_PLATFORMS.find((item) => item.id === platform)?.label ?? platform)
    .join(", ");
}
