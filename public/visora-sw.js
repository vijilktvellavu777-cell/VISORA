self.addEventListener("push", (event) => {
  let payload = { title: "VISORA", body: "You have a new notification." };
  try {
    payload = event.data?.json() ?? payload;
  } catch {
    payload.body = event.data?.text() ?? payload.body;
  }

  event.waitUntil(
    self.registration.showNotification(payload.title ?? "VISORA", {
      body: payload.body ?? "",
      icon: "/favicon.ico",
      data: payload,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});
