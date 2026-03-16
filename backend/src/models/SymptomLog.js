const mongoose = require('mongoose');

const symptomLogSchema = new mongoose.Schema({
    patient : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true , "Must Provide the user id"]
    },

    symptoms : {
        type: [String],
        required : [true , "Must Provide symptoms"]
    },

    predictedConditions : {
        type : [String]
    },

    severity : {
        type : String,
        enum : ['low','medium','high'],
        default : "low"
    },

    advice : {
        type : String,
        trim : true,
        default : "Follow general precautions"
    }
},{
    timestamps : true
});

const SymptomLog = new mongoose.model('SymptomLog',symptomLogSchema);

module.exports = SymptomLog