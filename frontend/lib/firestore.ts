import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  query,
  orderBy,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import type { User } from 'firebase/auth';
import { db } from './firebase';
import type { ColumnInfo, ChartConfig, Insight } from './types';

export const MAX_SAVED_DASHBOARDS = 3;

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
  colCount?: number;
  fileSizeBytes?: number;
  chartOrder?: string[];
  columns?: ColumnInfo[];
  preview?: Record<string, unknown>[];
  summaryStats?: any[];
  charts?: ChartConfig[];
  insights?: Insight[];
  status?: string;
  createdAt: any;
  updatedAt: any;
}

export interface FirestoreChatMessage {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
}

export interface SaveDashboardPayload {
  id: string;
  fileName: string;
  rowCount: number;
  columnCount: number;
  columns?: ColumnInfo[];
  preview?: Record<string, unknown>[];
  charts?: ChartConfig[];
  insights?: Insight[];
  chartOrder?: string[];
  summaryStats?: any[];
  fileSizeBytes?: number;
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
 * Retrieves all saved dashboards belonging to the specified user.
 */
export async function getUserSavedDashboards(userId: string): Promise<FirestoreDataset[]> {
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
    console.error('Error fetching user dashboards from Firestore:', err);
    return [];
  }
}

/**
 * Saves or updates a user dashboard with strict 3-dashboard quota enforcement.
 */
export async function saveUserDashboard(
  userId: string,
  payload: SaveDashboardPayload
): Promise<{ success: boolean; limitReached: boolean; count: number; error?: string }> {
  if (!userId || !payload.id) {
    return { success: false, limitReached: false, count: 0, error: 'User ID and Dataset ID are required' };
  }

  try {
    const datasetRef = doc(db, 'users', userId, 'datasets', payload.id);
    const existingDoc = await getDoc(datasetRef);

    if (!existingDoc.exists()) {
      // Check quota before creating a brand new dashboard
      const currentDashboards = await getUserSavedDashboards(userId);
      if (currentDashboards.length >= MAX_SAVED_DASHBOARDS) {
        return {
          success: false,
          limitReached: true,
          count: currentDashboards.length,
        };
      }

      const newDocData = {
        id: payload.id,
        userId,
        fileName: payload.fileName || 'Untitled Dashboard',
        rowCount: payload.rowCount || 0,
        columnCount: payload.columnCount || 0,
        colCount: payload.columnCount || 0,
        fileSizeBytes: payload.fileSizeBytes || 0,
        columns: payload.columns || [],
        preview: payload.preview ? payload.preview.slice(0, 100) : [],
        charts: payload.charts || [],
        insights: payload.insights || [],
        chartOrder: payload.chartOrder || [],
        summaryStats: payload.summaryStats || [],
        status: 'saved',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(datasetRef, newDocData);
      return { success: true, limitReached: false, count: currentDashboards.length + 1 };
    } else {
      // Existing dashboard being updated — does not count against quota
      const existingData = existingDoc.data();
      const updatedDocData = {
        id: payload.id,
        userId,
        fileName: payload.fileName || existingData.fileName || 'Untitled Dashboard',
        rowCount: payload.rowCount ?? existingData.rowCount ?? 0,
        columnCount: payload.columnCount ?? existingData.columnCount ?? 0,
        colCount: payload.columnCount ?? existingData.colCount ?? 0,
        fileSizeBytes: payload.fileSizeBytes ?? existingData.fileSizeBytes ?? 0,
        columns: payload.columns ?? existingData.columns ?? [],
        preview: payload.preview ? payload.preview.slice(0, 100) : existingData.preview ?? [],
        charts: payload.charts ?? existingData.charts ?? [],
        insights: payload.insights ?? existingData.insights ?? [],
        chartOrder: payload.chartOrder ?? existingData.chartOrder ?? [],
        summaryStats: payload.summaryStats ?? existingData.summaryStats ?? [],
        status: 'saved',
        createdAt: existingData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(datasetRef, updatedDocData);
      const currentDashboards = await getUserSavedDashboards(userId);
      return { success: true, limitReached: false, count: currentDashboards.length };
    }
  } catch (err: any) {
    console.error('Error saving dashboard to Firestore:', err);
    return { success: false, limitReached: false, count: 0, error: err?.message || 'Failed to save dashboard' };
  }
}

/**
 * Updates the title/fileName of an existing saved dashboard.
 */
export async function updateDashboardTitle(
  userId: string,
  datasetId: string,
  newTitle: string
): Promise<void> {
  if (!userId || !datasetId || !newTitle.trim()) return;
  const datasetRef = doc(db, 'users', userId, 'datasets', datasetId);
  const existingDoc = await getDoc(datasetRef);
  if (!existingDoc.exists()) return;

  const existingData = existingDoc.data();
  await setDoc(
    datasetRef,
    {
      ...existingData,
      fileName: newTitle.trim(),
      updatedAt: serverTimestamp(),
    }
  );
}

/**
 * Deletes a saved dashboard from Firestore.
 */
export async function deleteUserDashboard(userId: string, datasetId: string): Promise<void> {
  if (!userId || !datasetId) return;
  const datasetRef = doc(db, 'users', userId, 'datasets', datasetId);
  await deleteDoc(datasetRef);
}

/**
 * Fetches a single saved dashboard by ID.
 */
export async function getSavedDashboard(
  userId: string,
  datasetId: string
): Promise<FirestoreDataset | null> {
  if (!userId || !datasetId) return null;
  try {
    const datasetRef = doc(db, 'users', userId, 'datasets', datasetId);
    const snap = await getDoc(datasetRef);
    if (!snap.exists()) return null;
    return {
      ...snap.data(),
      id: snap.id,
    } as FirestoreDataset;
  } catch (err) {
    console.error('Error getting saved dashboard:', err);
    return null;
  }
}

/**
 * Saves a chat message to Firestore under users/{userId}/datasets/{datasetId}/messages.
 */
export async function saveChatMessage(
  userId: string,
  datasetId: string,
  message: {
    role: 'user' | 'assistant';
    content: string;
    chart?: any;
    isError?: boolean;
  }
): Promise<void> {
  if (!userId || !datasetId || !message.content) return;
  try {
    const messagesRef = collection(db, 'users', userId, 'datasets', datasetId, 'messages');
    const msgData: Record<string, any> = {
      role: message.role,
      content: message.content,
      timestamp: serverTimestamp(),
    };
    if (message.chart) msgData.chart = message.chart;
    if (typeof message.isError === 'boolean') msgData.isError = message.isError;
    await addDoc(messagesRef, msgData);
  } catch (err) {
    console.error('Error saving chat message to Firestore:', err);
  }
}

/**
 * Legacy aliases for backwards compatibility.
 */
export const getUserDatasets = getUserSavedDashboards;
export const updateDatasetAnalysis = saveUserDashboard;
export const saveDatasetRecord = saveUserDashboard;
