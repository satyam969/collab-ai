const mongoose= require('mongoose');


const projectSchema=mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
})

const Project =mongoose.models.Project || mongoose.models('Project',projectSchema);

module.exports = Project;