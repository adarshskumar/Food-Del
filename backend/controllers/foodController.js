import foodModel from "../models/foodModel.js";
import fs from 'fs'


// add food item
const addFood = async (req, res) => {
    let image_filename = `${req.file.filename}`;

    const food = new foodModel({ // create a new document inside the collection 'foods' in mongoDB
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: image_filename
    })
    try {
        await food.save(); // save to mongo db [validates schema and inserts document into MongoDB]
        res.json({success: true, message: 'Food Added'})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: 'Error while saving the product'})
    }
}

// list all foods from the db
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({});
        res.json({success: true, data: foods})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: 'Error getting list'});
    }
}

// remove food item
const removeFood = async (req, res) => {
    try {
        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => {}); 

        await foodModel.findByIdAndDelete(req.body.id); // delete that entry from mongo db
        res.json({success: true, message: 'Food Removed'});
    } catch (e) {
        console.log(e);
        res.json({success: false, message: 'Error removing food'});
    }
}

export { addFood, listFood, removeFood }