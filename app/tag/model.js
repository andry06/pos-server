const mongoose = require('mongoose');
const { model, Schema } = mongoose;

let tagSchema = Schema({
    name: {
        type: String,
        minlength: [3, 'Panjang nama tag makanan minimal 3 karakter'],
        maxlength: [20, 'Panjang nama tag makanan maksimal 20 karakter'],
        required: [true, 'Nama tag makanan harus diisi']
    }
});

module.exports = model('Tag', tagSchema);