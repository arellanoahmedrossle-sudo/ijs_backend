import mongoose from 'mongoose';

const gradePlacementSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: [ 
                "preKinderAndKinder", 
                "gradeSchool",
                "juniorHighSchool",
                "seniorHighSchool"
        ],
        required: true,
    },
    subLevel: {
        type: String,
        enum: [
            // Pre-Kinder & Kinder
            "preKinder", "kinder",
            // Grade School
            "grade1", "grade2", "grade3", "grade4", "grade5", "grade6",
            // Junior High School
            "grade7", "grade8", "grade9", "grade10",
            // Senior High School
            "grade11", "grade12"
        ],
        required: true
    }
}, { _id: false });

const studentSchema = new mongoose.Schema({
    studentNo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    middleName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    contactNumber: {
        type: String,
        default: "NA"
    },
    gradePlacement: {
        type: gradePlacementSchema,
        required: true,
    },
    discountApplied: { type: Number, min: 0, max: 1, default: 0 },
    password: {
        type: String,
        required: true,
        minlength: 6,   // enforce minimum length
    }, 
    role: {
        type: String,
        enum: [ 'student' ], // admin, cashier
        default: 'student',
    }

}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

export default Student;