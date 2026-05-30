/**
 * Upload, retrieve, and delete any file (images, videos, PDFs, docs, etc.)
 * stored in Firebase Storage per lead.
 *
 * Storage path: /users/{uid}/photos/{leadId}/{timestamp}-{filename}
 *
 * Firebase Storage note:
 *   Free Spark plan = 1 GB TOTAL storage.
 *   For large uploads (1 GB+ per property), upgrade to Blaze (pay-as-you-go).
 *   Blaze pricing: ~$0.026/GB/month stored, $0.12/GB downloaded.
 *
 * Setup (one-time in Firebase Console):
 * 1. Build → Storage → Get started → production mode
 * 2. Rules tab → paste and Publish:
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

// 1 GB limit per file (1024 MB)
const MAX_FILE_SIZE_MB = 1024;

// File type → emoji icon for non-image display
export function fileIcon(type = '', name = '') {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (type.startsWith('image/'))    return '🖼️';
  if (type.startsWith('video/'))    return '🎬';
  if (type.startsWith('audio/'))    return '🎵';
  if (type === 'application/pdf' || ext === 'pdf')  return '📄';
  if (['doc','docx'].includes(ext)) return '📝';
  if (['xls','xlsx'].includes(ext)) return '📊';
  if (['zip','rar','7z'].includes(ext)) return '📦';
  return '📎';
}

export function isImage(type = '') {
  return type.startsWith('image/');
}

export function isVideo(type = '') {
  return type.startsWith('video/');
}

export function formatSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)         return `${bytes} B`;
  if (bytes < 1024 ** 2)   return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)   return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export function useLeadPhotos(uid) {

  /**
   * Upload any file for a lead.
   * @param {number}   leadId
   * @param {File}     file
   * @param {function} onProgress  — called with 0–100
   * @returns {Promise<FileRecord|null>}
   */
  const uploadPhoto = useCallback(async (leadId, file, onProgress) => {
    if (!isFirebaseConfigured || !uid) return null;

    const limitBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > limitBytes) {
      throw new Error(`File must be under ${MAX_FILE_SIZE_MB} MB (1 GB). This file is ${formatSize(file.size)}.`);
    }

    const timestamp  = Date.now();
    const safeName   = file.name.replace(/[^a-zA-Z0-9._\-() ]/g, '_');
    const path       = `users/${uid}/photos/${leadId}/${timestamp}-${safeName}`;
    const storageRef = ref(storage, path);

    return new Promise((resolve, reject) => {
      const task = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
        customMetadata: {
          uploadedBy: auth.currentUser?.email ?? uid,
          leadId:     String(leadId),
          fileName:   file.name,
        },
      });

      task.on(
        'state_changed',
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          onProgress?.(pct);
        },
        (err) => reject(friendlyStorageError(err)),
        async () => {
          try {
            const url = await getDownloadURL(task.snapshot.ref);
            resolve({
              url,
              name:      file.name,
              size:      file.size,
              type:      file.type,
              path,
              timestamp: new Date().toISOString(),
            });
          } catch (e) {
            reject(friendlyStorageError(e));
          }
        },
      );
    });
  }, [uid]);

  const deletePhoto = useCallback(async (path) => {
    if (!isFirebaseConfigured || !path) return;
    try {
      await deleteObject(ref(storage, path));
    } catch (e) {
      if (e.code !== 'storage/object-not-found') throw e;
    }
  }, []);

  return { uploadPhoto, deletePhoto };
}

// Turn Firebase Storage error codes into actionable plain-English messages
function friendlyStorageError(e) {
  const code = e?.code ?? '';
  const messages = {
    'storage/retry-limit-exceeded':
      'Upload failed — Firebase Storage may not be activated yet.\n' +
      'Fix: Firebase Console → Build → Storage → Get started → Production mode → Publish rules.',
    'storage/unauthorized':
      'Permission denied. Make sure you are signed in and Storage rules are published.',
    'storage/canceled':
      'Upload was cancelled.',
    'storage/unknown':
      'An unknown error occurred. Check your internet connection and try again.',
    'storage/bucket-not-found':
      'Storage bucket not found. Enable Firebase Storage in the Firebase Console first.',
    'storage/quota-exceeded':
      'Firebase Storage quota exceeded. Upgrade to the Blaze plan at console.firebase.google.com.',
    'storage/unauthenticated':
      'You must be signed in to upload files.',
    'storage/object-not-found':
      'File not found in storage.',
  };
  return new Error(messages[code] ?? (e?.message || 'Upload failed. Please try again.'));
}
