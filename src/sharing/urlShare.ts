import pako from 'pako'
import type VirtualMachine from 'scratch-vm'

const MAX_URL_LENGTH = 8000

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64ToUint8(base64: string): Uint8Array {
  const padded = base64.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - base64.length % 4) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function encodeProjectToURL(vm: VirtualMachine): Promise<string | null> {
  const blob = await vm.saveProjectSb3()
  const buffer = await blob.arrayBuffer()
  const compressed = pako.deflate(new Uint8Array(buffer))
  const encoded = uint8ToBase64(compressed)

  const url = `${window.location.origin}${window.location.pathname}#sb3=${encoded}`
  if (url.length > MAX_URL_LENGTH) return null

  return url
}

export function decodeProjectFromURL(url: string): ArrayBuffer | null {
  try {
    const hash = new URL(url).hash
    const match = hash.match(/^#sb3=(.+)$/)
    if (!match) return null

    const compressed = base64ToUint8(match[1])
    const inflated = pako.inflate(compressed)
    return inflated.buffer as ArrayBuffer
  } catch {
    return null
  }
}

export function getProjectFromCurrentURL(): ArrayBuffer | null {
  const hash = window.location.hash
  if (!hash.startsWith('#sb3=')) return null

  try {
    const encoded = hash.slice(5)
    const compressed = base64ToUint8(encoded)
    const inflated = pako.inflate(compressed)
    return inflated.buffer as ArrayBuffer
  } catch {
    return null
  }
}

export function clearURLFragment(): void {
  history.replaceState(null, '', window.location.pathname + window.location.search)
}
