const mongoose = require('mongoose');
const {model, Schema} = mongoose;

let categorySchema = Schema({
    name: {
        type: String,
        minlength: [3, 'panjang nama makanan minimal 3 karakter'],
        maxlength: [20, 'panjang nama makanan Maksimal 20 karakter'],
        required: [true, 'Nama makanan harus diisi']
    },
});

module.exports = model('Category', categorySchema);