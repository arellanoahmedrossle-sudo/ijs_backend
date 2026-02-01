import Student from "../../../models/student.model.js";


export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().select('-password');
        res.json({ success: true, students });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const getStudentById = async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await Student.findById(studentId).select('-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        res.json({ success: true, student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateStudentGradePlacement = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { level, subLevel } = req.body;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        student.gradePlacement = { level, subLevel };
        await student.save();

        res.json({ success: true, student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}


export const updateStudentDiscount = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { discountApplied } = req.body;

        const student = await Student.findById(studentId).select('-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        student.discountApplied = discountApplied;
        await student.save();

        res.json({ success: true, student })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}

export const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findByIdAndDelete(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
}