import { MongoClient, Db } from 'mongodb';

interface MongoConnection {
  client: MongoClient | null;
  db: Db | null;
  isConnecting: boolean;
}

const globalWithMongo = globalThis as unknown as {
  _mongoConnection?: MongoConnection;
};

if (!globalWithMongo._mongoConnection) {
  globalWithMongo._mongoConnection = {
    client: null,
    db: null,
    isConnecting: false,
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

  if (connectionState.isConnecting) {
    // Wait a brief moment or retry
    for (let i = 0; i < 10; i++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (connectionState.db && connectionState.client) {
        return { db: connectionState.db, error: null, isConnected: true };
      }
    }
  }

  try {
    connectionState.isConnecting = true;
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
    connectionState.isConnecting = false;
    
    return { db: dbInstance, error: null, isConnected: true };
  } catch (err: any) {
    console.error('Failed to connect to MongoDB:', err);
    connectionState.client = null;
    connectionState.db = null;
    connectionState.isConnecting = false;
    return { db: null, error: err?.message || 'Unknown MongoDB connection error', isConnected: false };
  }
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
