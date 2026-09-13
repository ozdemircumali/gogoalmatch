self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {
      title: "GoGoalMatch",
      body: event.data ? event.data.text() : "Yeni maç bildirimi",
    };
  }

  const title = data.title || "GoGoalMatch";
  const body = data.body || "Favori maçında yeni gelişme var.";

  const options = {
    body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    tag: data.tag || "gogoalmatch-match",
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || "/",
      fixtureId: data.fixtureId || null,
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
