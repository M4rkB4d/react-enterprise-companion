// src/compliance/hooks/useEncryptedStorage.ts

/**
 * ENCRYPTED STORAGE HOOK
 *
 * Provides a localStorage-like interface but with AES-GCM
 * encryption. The encryption key is derived from the user's
 * session and cleared on logout.
 *
 * Usage:
 *   const { setItem, getItem, removeItem } = useEncryptedStorage();
 *   await setItem('draft_transfer', { amount: 500, recipient: 'Bob' });
 *   const draft = await getItem('draft_transfer');
 *
 * Cross-ref: §7.2 for encryption primitives
 * Cross-ref: Doc 09 §7 for session management
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { deriveKey, encryptData, decryptData, generateSalt } from '@/compliance/utils/web-crypto';

const SALT_KEY = '__encrypted_storage_salt__';

interface UseEncryptedStorageReturn {
  /** Store encrypted data */
  readonly setItem: (key: string, value: unknown) => Promise<void>;
  /** Retrieve and decrypt data */
  readonly getItem: <T = unknown>(key: string) => Promise<T | null>;
  /** Remove encrypted data */
  readonly removeItem: (key: string) => void;
  /** Clear all encrypted data (call on logout) */
  readonly clear: () => void;
  /** Whether the encryption key is ready */
  readonly isReady: boolean;
}

export function useEncryptedStorage(sessionToken: string): UseEncryptedStorageReturn {
  const keyRef = useRef<CryptoKey | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Derive the encryption key from the session token on mount
  useEffect(() => {
    async function initKey() {
      let salt: Uint8Array;
      const existingSalt = localStorage.getItem(SALT_KEY);

      if (existingSalt) {
        salt = Uint8Array.from(atob(existingSalt), (c) => c.charCodeAt(0));
      } else {
        salt = generateSalt();
        localStorage.setItem(SALT_KEY, btoa(String.fromCharCode(...salt)));
      }

      keyRef.current = await deriveKey(sessionToken, salt as Uint8Array<ArrayBuffer>);
      setIsReady(true);
    }

    initKey();

    // Clear key on unmount (session end)
    return () => {
      keyRef.current = null;
      setIsReady(false);
    };
  }, [sessionToken]);

  const setItem = useCallback(async (key: string, value: unknown): Promise<void> => {
    if (!keyRef.current) throw new Error('Encryption key not ready');
    const plaintext = JSON.stringify(value);
    const encrypted = await encryptData(keyRef.current, plaintext);
    localStorage.setItem(`__enc__${key}`, encrypted);
  }, []);

  const getItem = useCallback(async <T = unknown>(key: string): Promise<T | null> => {
    if (!keyRef.current) throw new Error('Encryption key not ready');
    const encrypted = localStorage.getItem(`__enc__${key}`);
    if (!encrypted) return null;

    try {
      const plaintext = await decryptData(keyRef.current, encrypted);
      return JSON.parse(plaintext) as T;
    } catch {
      console.warn(`[EncryptedStorage] Failed to decrypt key: ${key}`);
      return null;
    }
  }, []);

  const removeItem = useCallback((key: string): void => {
    localStorage.removeItem(`__enc__${key}`);
  }, []);

  const clear = useCallback(() => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('__enc__')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.removeItem(SALT_KEY);
    keyRef.current = null;
    setIsReady(false);
  }, []);

  return { setItem, getItem, removeItem, clear, isReady };
}
