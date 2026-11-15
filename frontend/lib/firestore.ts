import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import type { ColumnInfo, ChartConfig, Insight } from './types';

export interface FirestoreUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreDataset {
  id: string;
  userId: string;
  fileName: string;
  rowCount: number;
  columnCount: number;
  columns?: ColumnInfo[];
  preview?: Record<string, unknown>[];
  charts?: ChartConfig[];
  insights?: Insight[];
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

/**
 * Synchronizes the user's profile with the Firestore 'users' collection.
 */
export async function syncUserProfile(user: User): Promise<void> {
  if (!user) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const existing = await getDoc(userRef);

    if (!existing.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || null,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(
        userRef,
        {
          email: user.email || null,
          displayName: user.displayName || null,
          photoURL: user.photoURL || null,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  } catch (err) {
    console.error('Error syncing user profile to Firestore:', err);
  }
}

/**
 * Saves a new dataset record to Firestore under the authenticated user.
 */
export async function saveDatasetRecord(
  userId: string,
  dataset: {
    id: string;
    fileName: string;
    rowCount: number;
    columnCount: number;
    columns?: ColumnInfo[];
    preview?: Record<string, unknown>[];
  }
): Promise<void> {
  if (!userId || !dataset.id) return;
  try {
    const datasetRef = doc(db, 'users', userId, 'datasets', dataset.id);
    await setDoc(datasetRef, {
      id: dataset.id,
      userId,
      fileName: dataset.fileName,
      rowCount: dataset.rowCount,
      columnCount: dataset.columnCount,
      columns: dataset.columns || [],
      preview: dataset.preview ? dataset.preview.slice(0, 100) : [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error saving dataset to Firestore:', err);
  }
}

/**
 * Updates an existing dataset with charts and analysis results.
 */
export async function updateDatasetAnalysis(
  userId: string,
  datasetId: string,
  data: {
    charts?: ChartConfig[];
    insights?: Insight[];
  }
): Promise<void> {
  if (!userId || !datasetId) return;
  try {
    const datasetRef = doc(db, 'users', userId, 'datasets', datasetId);
    await setDoc(
      datasetRef,
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error('Error updating dataset analysis in Firestore:', err);
  }
}

/**
 * Retrieves all datasets belonging to the specified user.
 */
export async function getUserDatasets(userId: string): Promise<FirestoreDataset[]> {
  if (!userId) return [];
  try {
    const datasetsRef = collection(db, 'users', userId, 'datasets');
    const q = query(datasetsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    })) as FirestoreDataset[];
  } catch (err) {
    console.error('Error fetching user datasets from Firestore:', err);
    return [];
  }
}

/**
 * Saves a Q&A chat message under a dataset.
 */
export async function saveChatMessage(
  userId: string,
  datasetId: string,
  message: { role: 'user' | 'assistant'; content: string }
): Promise<void> {
  if (!userId || !datasetId) return;
  try {
    const messagesRef = collection(db, 'users', userId, 'datasets', datasetId, 'messages');
    await addDoc(messagesRef, {
      role: message.role,
      content: message.content,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error('Error saving chat message to Firestore:', err);
  }
}
