const Product = require('../product/model');
const CartItem = require('../cart-item/model');

const update = async (req, res, next) => {
    try {
        const { items } = req.body;
        productIds = items.map(item => item.product._id);
        const products = await Product.find({_id: {$in: productIds}});
        let cartItems = items.map(item => {
            let relatedProduct = products.find(product => product._id.toString() === item.product._id);
            return {
                product: relatedProduct._id,
                price: relatedProduct.price,
                image_url: relatedProduct.image_url,
                name: relatedProduct.name,
                user: req.user._id,
                qty: item.qty
            }
        });

        await CartItem.deleteMany({user: req.user._id});
        await CartItem.bulkWrite(cartItems.map(item => {
            return {
                updateOne: {
                    filter: {
                        user: req.user._id,
                        product: item.product
                    },
                    update: item, 
                    upsert: true,
                }
            }

        }));

        return res.json(cartItems);
        
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

const index = async (req, res, next) => {
    const { products } = req.query;
    try {
        let items = {};
        if(products){
            const productsArray = products.split(',');
            items = await CartItem
            .find({user: req.user._id, product: {$in : productsArray}})
            .populate('product');
        }else{
            items = await CartItem
                .find({user: req.user._id})
                // .find({user: req.user._id, product: {$in : ["650bb19049a5f7ccfb24b35d", "650bb26949a5f7ccfb24b372"]}})
                .populate('product');
        }
      
        return res.json(items);
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                erorr: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}


const destroy = async (req, res, next) => {
    try {
        // console.log(req.user._id)
        let cart = await CartItem.deleteMany({user: req.user._id});
        return res.json(cart);
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                erorr: 1,
                message: err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

module.exports = { 
    update,
    index,
    destroy
}