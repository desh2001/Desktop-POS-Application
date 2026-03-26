import mongoose, { Schema } from 'mongoose';

const ItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, default: 'General' },
}, { timestamps: true });

export const Item = mongoose.model('Item', ItemSchema);
