import { MongoClient, Db } from 'mongodb';

interface MongoConnection {
  client: MongoClient | null;
  db: Db | null;
  promise: Promise<{ db: Db | null; error: string | null; isConnected: boolean }> | null;
}

const globalWithMongo = globalThis as unknown as {
  _mongoConnection?: MongoConnection;
};

if (!globalWithMongo._mongoConnection) {
  globalWithMongo._mongoConnection = {
    client: null,
    db: null,
    promise: null,
  };
}

const connectionState = globalWithMongo._mongoConnection;

export interface DbStatus {
  isConnected: boolean;
  mode: 'MongoDB' | 'In-Memory Fallback';
  databaseName: string | null;
  error: string | null;
}

export async function getMongoDb(): Promise<{ db: Db | null; error: string | null; isConnected: boolean }> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return {
      db: null,
      error: 'MONGODB_URI environment variable is not defined. Running in Local In-Memory Fallback mode.',
      isConnected: false
    };
  }

  if (connectionState.db && connectionState.client) {
    return { db: connectionState.db, error: null, isConnected: true };
  }

  if (connectionState.promise) {
    return connectionState.promise;
  }

  connectionState.promise = (async () => {
    try {
      console.log('Attempting to connect to MongoDB...');
      const clientInstance = new MongoClient(uri, {
        connectTimeoutMS: 8000,
        socketTimeoutMS: 8000,
      });
      await clientInstance.connect();
      const dbInstance = clientInstance.db();
      console.log(`Connected to MongoDB successfully! Database: ${dbInstance.databaseName}`);
      
      connectionState.client = clientInstance;
      connectionState.db = dbInstance;
      return { db: dbInstance, error: null, isConnected: true };
    } catch (err: any) {
      console.error('Failed to connect to MongoDB:', err);
      connectionState.client = null;
      connectionState.db = null;
      connectionState.promise = null; // Reset so that a future call can try again
      return { db: null, error: err?.message || 'Unknown MongoDB connection error', isConnected: false };
    }
  })();

  return connectionState.promise;
}

export async function getDbStatus(): Promise<DbStatus> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return {
      isConnected: false,
      mode: 'In-Memory Fallback',
      databaseName: null,
      error: 'MONGODB_URI environment variable is missing.'
    };
  }

  const connection = await getMongoDb();
  if (connection.isConnected && connection.db) {
    return {
      isConnected: true,
      mode: 'MongoDB',
      databaseName: connection.db.databaseName,
      error: null
    };
  }

  return {
    isConnected: false,
    mode: 'In-Memory Fallback',
    databaseName: null,
    error: connection.error
  };
}
