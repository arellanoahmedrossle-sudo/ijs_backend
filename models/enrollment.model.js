import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    schoolYear: { type: String, required: true },
    semester: {
        type: String,
        enum: [ 'firstSemester', 'secondSemester', 'summer' ],
        required: true,
    },
    gradeLevel: { type: String, required: true },
    section: { type: String },
    program: { type: String },

    enrollmentDate: { type: Date, default: Date.now },
    completionDate: { type: Date },

    status: {
        type: String,
        enum: [ 'enrolled', 'dropped', 'completed' ],
        default: 'enrolled'
    },
    remarks: { type: String }
}, { timestamps: true });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);

export default Enrollment;