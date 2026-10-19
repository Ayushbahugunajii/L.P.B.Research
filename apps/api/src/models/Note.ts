import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  bookmarkId?: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bookmarkId: {
      type: Schema.Types.ObjectId,
      ref: 'Bookmark'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const NoteModel: Model<INote> =
  mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
