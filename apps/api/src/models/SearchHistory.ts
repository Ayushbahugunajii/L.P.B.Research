import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISearchHistory extends Document {
  userId: mongoose.Types.ObjectId;
  query: string;
  type: string;
  filters?: Record<string, unknown>;
  searchedAt: Date;
}

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    query: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      default: 'all'
    },
    filters: {
      type: Schema.Types.Mixed
    },
    searchedAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

SearchHistorySchema.index({ userId: 1, searchedAt: -1 });

export const SearchHistoryModel: Model<ISearchHistory> =
  mongoose.models.SearchHistory || mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
