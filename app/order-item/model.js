const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const orderItemSchema = Schema({

    name: {
        type: String,
        minlength: [5, 'Panjang nama makanan minimal 5 karakter'],
        requirder: [true, 'name must be filled'],
    },

    price: {
        type: Number,
        required: [true, 'Harga iem harus diisi']
    },

    qty: {
        type: Number,
        required: [true, 'Qty harus diisi'],
    },

    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },

    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }
});

module.exports = model('OrderItem', orderItemSchema);