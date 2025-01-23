const Product = require('../models/project-module');



const makeProject=async(body)=>{
    try {
        const product = new Product(body);
        await product.save();
        return product;
    } catch (error) {
        throw new Error(`Error creating project: ${error.message}`);
    }
}

const updateProject=async(body)=>{
    try {
        if (!body.id) {
            throw new Error('Project ID is required');
        }
        if (!body.title ||!body.description) {
            throw new Error('Title and description are required');
        }
        const product = await Product.findById(body.id);
        if (!product) {
            throw new Error('Project not found');
        }
        const updatedProduct = await Product.findByIdAndUpdate(body.id, { 
            title: body.title, 
            description: body.description 
        }, { new: true });
      
        return updatedProduct;
    } catch (error) {
        throw new Error(`Error updating project: ${error.message}`);
    }
}

const deleteProject=async(body)=>{
    try {
        if (!body.id) {
            throw new Error('Project ID is required');
        }

        const product = await Product.findById(body.id);

        if (!product) {
            throw new Error('Project not found');
        }

        const deletedProduct = await Product.findByIdAndDelete(body.id);
        if (!deletedProduct) {
            throw new Error('Project not found');
        }
        return deletedProduct;
    } catch (error) {
        throw new Error(`Error deleting project: ${error.message}`);
    }
}

module.exports={makeProject,updateProject,deleteProject};