/**
 * Upload, retrieve, and delete property photos stored in Firebase Storage.
 *
 * Storage path: /users/{uid}/photos/{leadId}/{timestamp}-{filename}
 * Photo metadata lives inside the lead object: lead.photos = [{url, name, size, timestamp}]
 *
 * Setup required (one-time in Firebase Console):
 * 1. Build → Storage → Get started → production mode
 * 2. Rules tab → paste:
 *
 *   rules_version = '2';
 *   service firebase.storage {
 *     match /b/{bucket}/o {
 *       match /users/{userId}/photos/{allPaths=**} {
 *         allow read, write: if request.auth != null && request.auth.uid == userId;
 *       }
 *     }
 *   }
 */

import { useCallback } from 'react';
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { storage, auth, isFirebaseConfigured } from '../firebase';

const MAX_FILE_SIZE_MB = 20;
const ALLOWED_TYPES    = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export function useLeadPhotos(uid) {

  /**
   * Upload one image file for a lead.
   * @param {number} leadId
   * @param {File}   file
   * @param {function} onProgress  — called with 0–100
   * @returns {Promise<{url,name,size,timestamp}|null>}
   */
  const uploadPhoto = useCallback(async (leadId, file, onProgress) => {
    if (!isFirebaseConfigured || !uid) return null;

    // Validate
    if (!ALLOWED_TYPES.includes(file.type) && !file.type.startsWith('image/')) {
      throw new Error('Please upload an image file (JPG, PNG, WEBP, HEIC).');
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      throw new Error(`Image must be under ${MAX_FILE_SIZE_MB} MB.`);
    }

    const timestamp  = Date.now();
    const safeName   = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path       = `users/${uid}/photos/${leadId}/${timestamp}-${safeName}`;
    const storageRef = ref(storage, path);

    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedBy: auth.currentUser?.email ?? uid,
          leadId:     String(leadId),
        },
      });

      task.on(
        'state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress?.(pct);
        },
        reject,
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({
              url,
              name:      file.name,
              size:      file.size,
              type:      file.type,
              path,            // keep for deletion
              timestamp: new Date().toISOString(),
            });
          } catch (e) {
            reject(e);
          }
        },
      );
    });
  }, [uid]);

  /**
   * Delete a photo from Storage.
   * @param {string} path  — the photo.path stored in the lead
   */
  const deletePhoto = useCallback(async (path) => {
    if (!isFirebaseConfigured || !path) return;
    try {
      await deleteObject(ref(storage, path));
    } catch (e) {
      // If already deleted, ignore
      if (e.code !== 'storage/object-not-found') throw e;
    }
  }, []);

  return { uploadPhoto, deletePhoto };
}
