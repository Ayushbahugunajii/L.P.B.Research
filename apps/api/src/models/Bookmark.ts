import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'video' | 'paper' | 'web';
  title: string;
  targetId: string;
  targetUrl: string;
  timestampSec?: number;
  snippet?: string;
  note?: string;
  folderId?: mongoose.Types.ObjectId;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['video', 'paper', 'web'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    targetId: {
      type: String,
      required: true
    },
    targetUrl: {
      type: String,
      required: true
    },
    timestampSec: {
      type: Number
    },
    snippet: {
      type: String
    },
    note: {
      type: String
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'Folder'
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

BookmarkSchema.index({ userId: 1, type: 1 });
BookmarkSchema.index({ userId: 1, folderId: 1 });
BookmarkSchema.index({ userId: 1, targetUrl: 1 });

export const BookmarkModel: Model<IBookmark> =
  mongoose.models.Bookmark || mongoose.model<IBookmark>('Bookmark', BookmarkSchema);
