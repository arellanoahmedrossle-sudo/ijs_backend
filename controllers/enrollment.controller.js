import Enrollment from "../models/enrollment.model.js";

export const createEnrollment = async (req, res) => {
    try {
        const { studentId, schoolYear, semester, gradeLevel, section, program } = req.body;
        
        const existing = await Enrollment.findOne({ student: studentId, schoolYear, semester });
        if (existing) return res.status(400).json({ success: false, message: 'Enrollment already exists for this term' });

        const enrollment = new Enrollment({
            student: studentId,
            schoolYear,
            semester,
            gradeLevel,
            section,
            program
        });

        await enrollment.save();
        res.status(201).json({ success: true, enrollment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getAllEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find().populate('student', 'studentNo firstName middleName lastName email');
        res.json({ success: true, enrollments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message })
    }
}

export const getEnrollmentById = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const enrollment = await Enrollment.findById(enrollmentId).populate('student', 'studentNo firstName middleName lastName email');

        if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });
        
        res.json({ success: true, enrollment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const updateEnrollmentStatus = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const { status, remarks } = req.body;

        const enrollment = await Enrollment.findById(enrollmentId);
        if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

        enrollment.status = status;
        if (status === 'completed') enrollment.completionDate = new Date();
        if (remarks) enrollment.remarks = remarks;

        await enrollment.save();
        res.json({ success: true, enrollment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const deleteEnrollment = async (req, res) => {
    try {
        const { enrollmentId } = req.params;
        const enrollment = await Enrollment.findByIdAndDelete(enrollmentId);

        if (!enrollment) return res.status(404).json({ success: false, message: 'Enrollment not found' });

        res.json({ success: true, message: 'Enrollment deleted successfully' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getStudentEnrollments = async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ student: req.user.id });
        res.json({ success: true, enrollments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getEnrollmentsByStudentId = async (req, res) => {
    try {
        const { studentId } = req.params;
        const enrollments = await Enrollment.find({ student: studentId });

        res.json({ success: true, enrollments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message })
    }
}