import mongoose from 'mongoose';

const miscFeesSchema = new mongoose.Schema({
    computer: { type: Number, default: 0 },
    internet: { type: Number, default: 0 },
    airConditioning: { type: Number, default: 0 },
    developmentFee: { type: Number, default: 0 },
    registration: { type: Number, default: 0 },
    library: { type: Number, default: 0 },
    scienceLab: { type: Number, default: 0 },
    sportsDevelopment: { type: Number, default: 0 },
    insurance: { type: Number, default: 0 },
    medical: { type: Number, default: 0 },
    instructionalMaterials: { type: Number, default: 0 },
    schoolPublication: { type: Number, default: 0 },
    guidanceAndTesting: { type: Number, default: 0 },
    capstoneProject: { type: Number, default: 0 },
}, { _id: false });

const gradeLevelFeeSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: [ 'preKinderAndKinder', 'gradeSchool', 'juniorHighSchool', 'seniorHighSchool' ],
        required: true,
    },
    subLevel: {
        type: String,
        enum: [
            'preKinder', 'kinder',
            'grade1', 'grade2', 'grade3', 'grade4', 'grade5', 'grade6',
            'grade7', 'grade8', 'grade9', 'grade10',
            'grade11', 'grade12',
        ],
        required: true,
    },
    tuitionFee: { type: Number, required: true },
    miscFees: { type: miscFeesSchema, default: {} },
}, { _id: false });

const feeStructureSchema = mongoose.Schema({
    schoolYear: { type: String, required: true },
    fees: [ gradeLevelFeeSchema ]
}, { timestamps: true });

const FeeStructure = mongoose.model('FeeStructure', feeStructureSchema);

export default FeeStructure;