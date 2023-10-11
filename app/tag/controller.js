const Tag = require('./model');

const index = async (req, res, next) => {
    try{
        let tag = await Tag.find();
        return res.json(tag);
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message:err.message,
                fields: err.errors
            });
        }
        next(err);
    }
}

const store = async(req, res, next) => {
    try{
        let payload = req.body;
        let tag = new Tag(payload);
        await tag.save();
        return res.json(tag);
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields:err.errors
            });
        }
        next(err);
    }
}

const update = async(req, res, next) => {
    try{
        let payload = req.body;
        let { id } = req.params;
        let tag = await Tag.findByIdAndUpdate(id, payload, {new: true, runValidators: true });
        return res.json(tag);
    }catch(err){
        if(err && err.name === 'ValidationError'){
            return res.json({
                error: 1,
                message: err.message,
                fields: err.error
            });
        }
        next(err);
    }
}

let destroy = async(req, res, next) => {
    try{
        let tag = await Tag.findByIdAndDelete(req.params.id);
        return res.json(tag);
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

module.exports = {
    index,
    store,
    update,
    destroy
}