const CACHE_NAME = "safedriver-v2"
const STATIC_CACHE = "safedriver-static-v2"
const DYNAMIC_CACHE = "safedriver-dynamic-v2"

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/alerts",
  "/drivers",
  "/fleet",
  "/routes",
  "/analytics",
  "/offline",
  "/manifest.json",
  // Add critical CSS and JS files
]

// API endpoints to cache
const API_CACHE_PATTERNS = [/\/api\/alerts/, /\/api\/drivers/, /\/api\/fleet/, /\/api\/routes/, /\/api\/dashboard/]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("Caching static assets")
      return cache.addAll(STATIC_ASSETS)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log("Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Push event - handle incoming push notifications
self.addEventListener("push", (event) => {
  console.log("Push notification received:", event)

  let notificationData = {
    title: "SafeDriver Alert",
    body: "You have a new notification",
    icon: "/placeholder-logo.png",
    badge: "/placeholder-logo.png",
    tag: "safedriver-notification",
    requireInteraction: false,
    actions: [],
    data: {},
  }

  if (event.data) {
    try {
      const payload = event.data.json()
      notificationData = { ...notificationData, ...payload }
    } catch (error) {
      console.log("Failed to parse push payload:", error)
      notificationData.body = event.data.text() || notificationData.body
    }
  }

  // Customize notification based on type
  if (notificationData.type) {
    switch (notificationData.type) {
      case "critical_alert":
        notificationData.requireInteraction = true
        notificationData.tag = "critical-alert"
        notificationData.actions = [
          { action: "acknowledge", title: "Acknowledge" },
          { action: "view", title: "View Details" },
        ]
        break

      case "driver_emergency":
        notificationData.requireInteraction = true
        notificationData.tag = "driver-emergency"
        notificationData.actions = [
          { action: "contact", title: "Contact Driver" },
          { action: "dispatch", title: "Dispatch Help" },
        ]
        break

      case "maintenance_due":
        notificationData.actions = [
          { action: "schedule", title: "Schedule" },
          { action: "dismiss", title: "Dismiss" },
        ]
        break

      case "route_deviation":
        notificationData.actions = [
          { action: "track", title: "Track Vehicle" },
          { action: "contact", title: "Contact Driver" },
        ]
        break
    }
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, notificationData))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event)

  event.notification.close()

  const { action, data } = event
  const notificationData = event.notification.data || {}

  let urlToOpen = "/"

  // Handle action clicks
  if (action) {
    switch (action) {
      case "acknowledge":
        urlToOpen = `/alerts/${notificationData.alertId}?action=acknowledge`
        break
      case "view":
        urlToOpen = `/alerts/${notificationData.alertId}`
        break
      case "contact":
        urlToOpen = `/drivers/${notificationData.driverId}?action=contact`
        break
      case "dispatch":
        urlToOpen = `/emergency/${notificationData.alertId}`
        break
      case "schedule":
        urlToOpen = `/fleet/${notificationData.vehicleId}/maintenance`
        break
      case "track":
        urlToOpen = `/routes/${notificationData.routeId}/track`
        break
      case "dismiss":
        // Just close the notification
        return
    }
  } else {
    // Handle notification body click
    if (notificationData.url) {
      urlToOpen = notificationData.url
    } else if (notificationData.alertId) {
      urlToOpen = `/alerts/${notificationData.alertId}`
    } else if (notificationData.driverId) {
      urlToOpen = `/drivers/${notificationData.driverId}`
    }
  }

  // Open the URL
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen.split("?")[0]) && "focus" in client) {
          return client.focus()
        }
      }

      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    }),
  )
})

// Notification close event
self.addEventListener("notificationclose", (event) => {
  console.log("Notification closed:", event.notification.tag)

  // Track notification dismissal
  const notificationData = event.notification.data || {}
  if (notificationData.trackDismissal) {
    fetch("/api/notifications/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "dismissed",
        notificationId: notificationData.id,
        timestamp: Date.now(),
      }),
    }).catch((error) => console.log("Failed to track dismissal:", error))
  }
})

// Fetch event - implement caching strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Bypass Next.js internal files - let Next.js handle these
  if (url.pathname.startsWith("/_next/")) {
    return
  }

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request))
    return
  }

  // Handle navigation requests
  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  // Handle other requests (images, CSS, JS)
  event.respondWith(handleResourceRequest(request))
})

// API request handler - Network first, then cache (only for GET requests)
async function handleApiRequest(request) {
  const cacheName = DYNAMIC_CACHE

  // Don't cache POST, PUT, DELETE, PATCH requests - only GET requests
  if (request.method !== "GET") {
    return fetch(request)
  }

  try {
    // Try network first
    const networkResponse = await fetch(request)

    // Return the response even if it's not ok (to show real API errors)
    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, networkResponse.clone())
    }
    
    // Always return the network response so real errors are visible
    return networkResponse
  } catch (error) {
    // Only fallback to cache/offline if the fetch itself failed (network error)
    // This means the server couldn't be reached, not that it returned an error
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      // Add offline indicator to response
      const modifiedResponse = new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers: {
          ...cachedResponse.headers,
          "X-Served-From": "cache",
          "X-Offline": "true",
        },
      })
      return modifiedResponse
    }

    // Return offline fallback only if we truly can't reach the server
    return new Response(
      JSON.stringify({
        error: "Offline",
        message: "Unable to reach the server. Please check your connection and ensure the dev server is running.",
        offline: true,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

// Navigation request handler - Cache first for app shell
async function handleNavigationRequest(request) {
  try {
    // Try cache first for app shell
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    // Fallback to network
    const networkResponse = await fetch(request)

    // Cache the response
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())

    return networkResponse
  } catch (error) {
    // Return offline page
    return caches.match("/offline") || new Response("Offline")
  }
}

// Resource request handler - Cache first, then network (only for GET requests)
async function handleResourceRequest(request) {
  try {
    // Only cache GET requests - POST, PUT, DELETE, etc. should not be cached
    if (request.method !== "GET") {
      return fetch(request)
    }

    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)

    // Only cache successful GET responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }

    return networkResponse
  } catch (error) {
    // Return a fallback for images
    if (request.destination === "image") {
      return new Response(
        '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Offline</text></svg>',
        { headers: { "Content-Type": "image/svg+xml" } },
      )
    }

    throw error
  }
}

// Background sync for queued actions
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncQueuedActions())
  }
})

async function syncQueuedActions() {
  try {
    // Get queued actions from IndexedDB
    const queuedActions = await getQueuedActions()

    for (const action of queuedActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        })

        // Remove from queue on success
        await removeQueuedAction(action.id)
      } catch (error) {
        console.log("Failed to sync action:", action.id)
      }
    }
  } catch (error) {
    console.log("Background sync failed:", error)
  }
}

// Helper functions for IndexedDB operations
async function getQueuedActions() {
  // Implementation would use IndexedDB to get queued actions
  return []
}

async function removeQueuedAction(id) {
  // Implementation would use IndexedDB to remove action
}
