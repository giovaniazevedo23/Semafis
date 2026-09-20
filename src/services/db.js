import { collection, doc, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// Listeners genéricos para coleções
export const listenCollection = (collectionName, callback) => {
  const q = query(collection(db, collectionName));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    console.error(`Erro ao ouvir coleção ${collectionName}:`, error);
  });
};

export const listenDocument = (collectionName, docId, callback) => {
  if (!docId) return null;
  return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Erro ao ouvir documento ${collectionName}/${docId}:`, error);
  });
};

// Funções de Escrita
export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error(`Erro ao adicionar documento na coleção ${collectionName}:`, error);
    throw error;
  }
};

export const setDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
  } catch (error) {
    console.error(`Erro ao setar documento ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, updates) => {
  try {
    await updateDoc(doc(db, collectionName, docId), updates);
  } catch (error) {
    console.error(`Erro ao atualizar documento ${collectionName}/${docId}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error(`Erro ao deletar documento ${collectionName}/${docId}:`, error);
    throw error;
  }
};

// Storage
export const uploadFile = async (path, file) => {
  if (!file) return null;
  try {
    const storageRef = ref(storage, path);
    // Define um timeout maior (30 segundos) para permitir o upload de PDFs pesados
    const uploadTask = uploadBytes(storageRef, file);
    const timeoutTask = new Promise((_, reject) => setTimeout(() => reject(new Error("Upload timeout (Servidor demorou a responder)")), 30000));
    
    await Promise.race([uploadTask, timeoutTask]);
    
    const downloadUrl = await getDownloadURL(storageRef);
    return downloadUrl;
  } catch (error) {
    console.error(`Erro ao fazer upload do arquivo para ${path}:`, error);
    throw error;
  }
};
