import Student from '../../models/student.model.js';

export const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        res.json({ success: true, student });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch student profile' });
    }
}

export const updateStudentProfile = async (req, res) => {
    try {
        const updates = req.body;
        const student = await Student.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');

        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        res.json({ success: true, message: 'Profile updated successfully', student });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to update profile'});
    }
}

export const deleteStudentAccount = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.user.id);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        res.json({ success: true, message: 'Account deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete account' });
    }
}
