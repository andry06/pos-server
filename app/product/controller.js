const path = require('path');
const fs = require('fs');
const config = require('../config');
const Product = require('./model');
const Category = require('../category/model');
const Tag = require('../tag/model')

const index = async (req, res, next) => {
    try {
        let { skip = 0, limit = 10, q = '', category = '', tags = [] } = req.query;

        let  criteria = {};

        if(q.length){
            criteria = {...criteria, name: {$regex: `${q}`, $options: 'i'}}
        }

        if(category.length){
            let categoryResult = await Category.findOne({name: {$regex: `${category}`, $options: 'i'}});

            if(categoryResult) {
                criteria = {...criteria, category: categoryResult._id}
            }
        }

        if(tags.length){
            let tagsResult = await Tag.find({name: {$in: tags}});
            if(tagsResult.length > 0) {
                criteria = {...criteria, tags: {$in: tagsResult.map(tag => tag._id)}}
            }
        }

        if(category.length){
            
        }
        
        let count = await Product.find(criteria).countDocuments();


        let product = await Product
            .find(criteria)
            .skip(parseInt(skip))
            .limit(parseInt(limit))
            .populate('category')   //tambahan utk relasi dengan category
            .populate('tags');   //tambahan utk relasi dengan tags
        return res.json({
            data: product,
            count });
    }catch (err) {
        next(err);
    }
}

const store = async (req, res, next) => {
    try{
        let payload = req.body;
        
        //update karena relasi dengan category one to one
        if(payload.category){
            let category = await Category.findOne({name: {$regex: payload.category, $options: 'i'}});
            if(category){
                payload = {...payload, category: category._id};
            }else{
                delete payload.category;
            }
        }

         //update karena relasi dengan tags one to many
        if(payload.tags && payload.tags.length > 0){
            let tags = await Tag.find({name: {$in: payload.tags}});
           
            if(tags.length){
                
                payload = {...payload, tags: tags.map(tag => tag._id)}
                console.log(payload)
            }else{
                delete payload.tags;
            }
        }

        if(req.file){
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);

            const src = fs.createReadStream(tmp_path); // utk membaca file
            const dest = fs.createWriteStream(target_path); //utk menulis atau memindah kan file ke target path
            src.pipe(dest);  

            src.on('end', async () => {
                try{
                    let product = new Product({...payload, image_url: filename})
                    await product.save()
                    return res.json(product);
                }catch(err){
                    //jika ada error dari validasi nya maka hapus image file nya
                    fs.unlinkSync(target_path); // utk hapus image
                    if(err && err.name === 'ValidationError'){
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }
                    next(err);
                }
            });
            
            src.on('error', async() => {
                next(err);
            }); 
        }else{
            let product = new Product(payload);
            await product.save();
            return res.json(product);
        }
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const update = async (req, res, next) => {
    try{
        let payload = req.body;
        let { id } = req.params;

        //update karena relasi dengan category one to one
        if(payload.category){
            let category = await Category.findOne({name: {$regex: payload.category, $options: 'i'}});
            if(category){
                payload = {...payload, category: category._id};
            }else{
                delete payload.category;
            }
        }

         //update karena relasi dengan tags one to many
        if(payload.tags && payload.tags.length > 0){
            let tags = await Tag.find({name: {$in: payload.tags}});
            if(tags.length){
                payload = {...payload, tags: tags.map(tag => tag._id)};
            }else{
                delete payload.tags
            }
        }

        if(req.file){
            let tmp_path = req.file.path;
            let originalExt = req.file.originalname.split('.')[req.file.originalname.split('.').length - 1];
            let filename = req.file.filename + '.' + originalExt;
            let target_path = path.resolve(config.rootPath, `public/images/products/${filename}`);

            const src = fs.createReadStream(tmp_path);
            const dest = fs.createWriteStream(target_path);
            src.pipe(dest);

            src.on('end', async () => {
                try {

                    let product = await Product.findById(id);
                    let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;

                    if(fs.existsSync(currentImage)){
                        fs.unlinkSync(currentImage);
                    }

                    product = await Product.findByIdAndUpdate(id, payload, {
                        new: true,
                        runValidators: true
                    });
                    return res.json(product);
                }catch(err){
                    fs.unlinkSync(target_path);
                    if(err && err.name === 'ValidationError'){
                        return res.json({
                            error: 1,
                            message: err.message,
                            fields: err.errors
                        })
                    }
                    next(err);
                }
            });

            src.on('error', async() => {
                next(err);
            });

        }else{
            let product = await Product.findByIdAndUpdate(id, payload, {
                new: true,
                runValidators: true
            });
            return res.json(product) 
        }
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const destroy = async(req, res, next) => {
    try {
        let product = await Product.findByIdAndDelete(req.params.id);
        let currentImage = `${config.rootPath}/public/images/products/${product.image_url}`;
        if(fs.existsSync(currentImage)){
            fs.unlinkSync(currentImage)
        }
        return res.json(product);
    }catch(err){
        next(err);
    }
}

module.exports = {
    index,
    store,
    update,
    destroy
}