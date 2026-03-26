import mongoose, { Schema } from 'mongoose';

const SaleItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const SaleSchema = new Schema({
  workerId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [SaleItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  amountTendered: { type: Number, required: true, default: 0 },
  change: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const Sale = mongoose.model('Sale', SaleSchema);
