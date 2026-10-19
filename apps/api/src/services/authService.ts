import argon2 from 'argon2';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { UserModel } from '../models/User.js';

// In-memory fallback if MongoDB is offline
const inMemoryUsers = new Map<string, { id: string; email: string; name: string; passwordHash: string; createdAt: Date }>();

async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password);
  } catch {
    // Fallback if native module issue
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }
}

async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  try {
    if (hash.startsWith('scrypt:')) {
      const [, salt, originalHash] = hash.split(':');
      if (!salt || !originalHash) return false;
      const computed = crypto.scryptSync(plain, salt, 64).toString('hex');
      return crypto.timingSafeEqual(Buffer.from(originalHash), Buffer.from(computed));
    }
    return await argon2.verify(hash, plain);
  } catch {
    return false;
  }
}

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await hashPassword(password);

    if (mongoose.connection.readyState === 1) {
      const existing = await UserModel.findOne({ email: normalizedEmail });
      if (existing) {
        throw new Error('User already exists with this email address');
      }

      const user = await UserModel.create({
        name,
        email: normalizedEmail,
        passwordHash
      });

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      };
    }

    // In-memory fallback
    if (inMemoryUsers.has(normalizedEmail)) {
      throw new Error('User already exists with this email address');
    }

    const id = `mem_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const userRecord = {
      id,
      name,
      email: normalizedEmail,
      passwordHash,
      createdAt: now
    };
    inMemoryUsers.set(normalizedEmail, userRecord);

    return {
      id,
      name,
      email: normalizedEmail,
      createdAt: now.toISOString()
    };
  }

  static async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findOne({ email: normalizedEmail });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isValid = await verifyPassword(user.passwordHash, password);
      if (!isValid) {
        throw new Error('Invalid email or password');
      }

      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      };
    }

    // In-memory fallback
    const user = inMemoryUsers.get(normalizedEmail);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt.toISOString()
    };
  }

  static async findById(id: string) {
    if (mongoose.connection.readyState === 1) {
      const user = await UserModel.findById(id);
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString()
      };
    }

    for (const user of inMemoryUsers.values()) {
      if (user.id === id) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString()
        };
      }
    }

    return null;
  }
}
