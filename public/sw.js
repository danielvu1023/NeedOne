self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/my-favicon/web-app-manifest-192x192.png",
      badge: "/codepen_logo_icon_267544.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
        url: data.url,
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  const urlToOpen = event.notification.data.url;
  event.waitUntil(clients.openWindow(urlToOpen));
});
