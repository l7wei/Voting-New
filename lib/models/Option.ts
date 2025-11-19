import mongoose, { Schema, Model } from 'mongoose';
import { IOption } from '@/types';

const OptionSchema = new Schema<IOption>({
  activity_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Activity',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
} as const);

export const Option: Model<IOption> = mongoose.models.Option || mongoose.model<IOption>('Option', OptionSchema);
