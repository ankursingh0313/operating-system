export type CustomWallpaperSlot = 'default' | 'light'

const DB_NAME = 'dossieros_custom_wallpapers_db'
const STORE_NAME = 'wallpapers'
const DB_VERSION = 1

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
  'image/gif',
  'image/png',
  'image/jpeg',
  'image/webp',
])

export const ALLOWED_IMAGE_EXTENSIONS = /\.(gif|png|jpe?g|webp)$/i

export function isSupportedWallpaperFile(file: File): boolean {
  const mimeOk = ALLOWED_IMAGE_MIME_TYPES.has(file.type.toLowerCase())
  const extOk = ALLOWED_IMAGE_EXTENSIONS.test(file.name)
  return mimeOk || extOk
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'))
  })
}

export async function saveCustomWallpaper(
  slot: CustomWallpaperSlot,
  dataUrl: string
): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(dataUrl, slot)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to save wallpaper'))
  })
}

export async function getCustomWallpaper(
  slot: CustomWallpaperSlot
): Promise<string | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(slot)
    req.onsuccess = () => resolve(typeof req.result === 'string' ? req.result : null)
    req.onerror = () => reject(req.error ?? new Error('Failed to read wallpaper'))
  })
}

export async function clearCustomWallpaper(
  slot: CustomWallpaperSlot
): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(slot)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('Failed to delete wallpaper'))
  })
}

export async function loadAllCustomWallpapers(): Promise<{
  defaultUrl: string | null
  lightUrl: string | null
}> {
  try {
    const [defaultUrl, lightUrl] = await Promise.all([
      getCustomWallpaper('default'),
      getCustomWallpaper('light'),
    ])
    return { defaultUrl, lightUrl }
  } catch {
    return { defaultUrl: null, lightUrl: null }
  }
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Invalid image file result'))
      }
    }
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}