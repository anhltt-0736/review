const PREFIXES = {
  favorites: "nexus:favorites:",
  following: "nexus:following:",
}

function safeRead(key: string): string[] {
  if (typeof window === "undefined") {
    return []
  }

  const stored = window.localStorage.getItem(key)
  if (!stored) {
    return []
  }

  try {
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed.map((value) => String(value))
    }
  } catch {
    // ignore parsing errors, fall through to empty array
  }

  return []
}

function safeWrite(key: string, value: string[]) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export function favoritesKey(userId: string) {
  return `${PREFIXES.favorites}${userId}`
}

export function followingKey(userId: string) {
  return `${PREFIXES.following}${userId}`
}

export function getFavorites(userId: string) {
  return safeRead(favoritesKey(userId))
}

export function setFavorites(userId: string, slugs: string[]) {
  safeWrite(favoritesKey(userId), slugs)
}

export function toggleFavorite(userId: string, slug: string) {
  const current = new Set(getFavorites(userId))
  if (current.has(slug)) {
    current.delete(slug)
  } else {
    current.add(slug)
  }

  const next = Array.from(current)
  setFavorites(userId, next)
  return next
}

export function getFollowing(userId: string) {
  return safeRead(followingKey(userId))
}

export function setFollowing(userId: string, usernames: string[]) {
  safeWrite(followingKey(userId), usernames)
}

export function toggleFollowing(userId: string, username: string) {
  const current = new Set(getFollowing(userId))
  if (current.has(username)) {
    current.delete(username)
  } else {
    current.add(username)
  }

  const next = Array.from(current)
  setFollowing(userId, next)
  return next
}
