import { getFirestore } from 'firebase-admin/firestore';

/**
 * Resolve leads document for a user (personal or active org pool).
 * @param {string} uid
 * @returns {Promise<FirebaseFirestore.DocumentReference>}
 */
export async function getLeadsDocRef(uid) {
  const db = getFirestore();
  const profileSnap = await db.doc(`users/${uid}/data/profile`).get();
  const orgId = profileSnap.data()?.activeOrgId;
  if (orgId) {
    const memberSnap = await db.doc(`orgs/${orgId}/members/${uid}`).get();
    if (memberSnap.exists) {
      return db.doc(`orgs/${orgId}/data/leads`);
    }
  }
  return db.doc(`users/${uid}/data/leads`);
}
