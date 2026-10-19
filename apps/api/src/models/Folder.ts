import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFolder extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      default: '#3b82f6'
    }
  },
  {
    timestamps: true
  }
);

FolderSchema.index({ userId: 1, name: 1 }, { unique: true });

export const FolderModel: Model<IFolder> =
  mongoose.models.Folder || mongoose.model<IFolder>('Folder', FolderSchema);
