import { addMedicalRecord, deleteMedicalRecord } from "../api/patientApi";

const DB_NAME = "seva-ehr-cache";
const DB_VERSION = 1;
const RECORD_STORE = "records";
const PENDING_STORE = "pendingOps";
const META_STORE = "meta";

const isBrowser = typeof window !== "undefined";

const openDatabase = () =>
  new Promise((resolve, reject) => {
    if (!isBrowser || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(RECORD_STORE)) {
        db.createObjectStore(RECORD_STORE, { keyPath: "_id" });
      }

      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB."));
  });

const withStore = async (storeName, mode, executor) => {
  const db = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);

    let result;

    transaction.oncomplete = () => {
      db.close();
      resolve(result);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error || new Error(`Transaction failed for ${storeName}.`));
    };
    transaction.onabort = () => {
      db.close();
      reject(transaction.error || new Error(`Transaction aborted for ${storeName}.`));
    };

    result = executor(store, transaction);
  });
};

const readAll = (store) =>
  new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error("Failed to read store."));
  });

const readOne = (store, key) =>
  new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error("Failed to read item."));
  });

const putOne = (store, value) =>
  new Promise((resolve, reject) => {
    const request = store.put(value);
    request.onsuccess = () => resolve(value);
    request.onerror = () => reject(request.error || new Error("Failed to write item."));
  });

const deleteOne = (store, key) =>
  new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Failed to delete item."));
  });

const clearStore = (store) =>
  new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Failed to clear store."));
  });

export const isHealthRecordCacheSupported = () => Boolean(isBrowser && window.indexedDB);

export const getCachedHealthRecords = async () =>
  withStore(RECORD_STORE, "readonly", (store) => readAll(store));

export const replaceCachedHealthRecords = async (records) =>
  withStore(RECORD_STORE, "readwrite", async (store) => {
    await clearStore(store);

    for (const record of records) {
      await putOne(store, record);
    }

    return records;
  });

export const upsertCachedHealthRecord = async (record) =>
  withStore(RECORD_STORE, "readwrite", (store) => putOne(store, record));

export const removeCachedHealthRecord = async (recordId) =>
  withStore(RECORD_STORE, "readwrite", (store) => deleteOne(store, recordId));

export const getPendingHealthRecordOps = async () =>
  withStore(PENDING_STORE, "readonly", (store) => readAll(store));

export const queueHealthRecordOp = async (operation) =>
  withStore(PENDING_STORE, "readwrite", (store) =>
    putOne(store, {
      ...operation,
      createdAt: operation.createdAt || new Date().toISOString()
    })
  );

export const removePendingHealthRecordOp = async (id) =>
  withStore(PENDING_STORE, "readwrite", (store) => deleteOne(store, id));

export const getHealthRecordMeta = async (key) =>
  withStore(META_STORE, "readonly", (store) => readOne(store, key));

export const setHealthRecordMeta = async (key, value) =>
  withStore(META_STORE, "readwrite", (store) => putOne(store, { key, value }));

export const applyPendingHealthRecordOps = (records, pendingOps) => {
  let nextRecords = [...records];

  pendingOps
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .forEach((operation) => {
      if (operation.type === "add" && operation.record) {
        nextRecords = [operation.record, ...nextRecords.filter((entry) => entry._id !== operation.record._id)];
      }

      if (operation.type === "delete" && operation.recordId) {
        nextRecords = nextRecords.filter((entry) => entry._id !== operation.recordId);
      }
    });

  return nextRecords;
};

export const syncPendingHealthRecordOps = async () => {
  const pendingOps = await getPendingHealthRecordOps();
  let syncedCount = 0;
  let failedCount = 0;

  for (const operation of pendingOps.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))) {
    try {
      if (operation.type === "add" && operation.payload) {
        const response = await addMedicalRecord(operation.payload);

        if (response?.success && response.record) {
          await removeCachedHealthRecord(operation.record?._id || operation.clientRecordId);
          await upsertCachedHealthRecord(response.record);
        }
      }

      if (operation.type === "delete" && operation.recordId) {
        await deleteMedicalRecord(operation.recordId);
        await removeCachedHealthRecord(operation.recordId);
      }

      await removePendingHealthRecordOp(operation.id);
      syncedCount += 1;
    } catch (error) {
      failedCount += 1;
    }
  }

  if (syncedCount > 0) {
    await setHealthRecordMeta("lastSyncAt", new Date().toISOString());
  }

  return { syncedCount, failedCount };
};
