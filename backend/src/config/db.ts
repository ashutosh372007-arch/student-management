import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!mongoURI) {
      console.warn('⚠️ MONGODB_URI is not set in Environment Variables! Attempting fallback to localhost...');
    }
    const uriToConnect = mongoURI || 'mongodb://localhost:27017/student-management';
    await mongoose.connect(uriToConnect);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    if (!process.env.MONGODB_URI && !process.env.MONGO_URI) {
      console.error('👉 TIP FOR RENDER/CLOUD DEPLOYMENT: Please set MONGODB_URI in Render Environment Variables!');
    }
    // Don't kill the server - let it stay alive so Render doesn't mark deploy as failed
    // The server will respond with appropriate errors when DB operations are attempted
    console.error('⚠️ Server will continue running without DB. Fix your MONGODB_URI and redeploy.');
  }
};

export default connectDB;
