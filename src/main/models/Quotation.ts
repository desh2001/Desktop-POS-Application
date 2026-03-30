import mongoose, { Schema } from 'mongoose';

const QuotationItemSchema = new Schema({
  item: { type: Schema.Types.ObjectId, ref: 'Item' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const QuotationSchema = new Schema({
  workerId: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [QuotationItemSchema],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  amountTendered: { type: Number, required: false, default: 0 },
  change: { type: Number, required: false, default: 0 },
}, { timestamps: true });

export const Quotation = mongoose.model('Quotation', QuotationSchema);
