import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import Student from '../../models/student.model.js';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';



dotenv.config();

export const handleRegister = async (req, res) => {
    try {
        const { 
                studentNo, 
                firstName, 
                lastName, 
                middleName, 
                email, 
                contactNumber, 
                gradePlacement, 
                discountApplied, 
                password,
                role 
        } = req.body;

        // Check if student already exists by studentNo
        const existingStudentNo = await Student.findOne({ studentNo });
        if (existingStudentNo) return res.status(400).json({ success: false, message: 'Student number already registered' });


        // Check if student already exists by email
        const existingEmail = await Student.findOne({ email });
        if (existingEmail) return res.status(400).json({ success: false, message: 'Email already registered' });

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new student
        const newStudent = new Student({
            studentNo,
            firstName,
            lastName,
            middleName,
            email,
            contactNumber,
            gradePlacement,
            discountApplied,
            password: hashedPassword,
            role
        });

        await newStudent.save();

        res.status(201).json({ success: true, message: 'Student registered successfully' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


export const handleLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        let student = await Student.findOne({ studentNo: identifier });
        if (!student) {
            student = await Student.findOne({ email: identifier });
        }
        if (!student) return res.status(400).json({ success: false, message: 'Student not found' });

        const isMatch = await bcrypt.compare(password, student.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        // Generate JWT
        const token = jwt.sign(
            { id: student._id, studentNo: student.studentNo, role: student.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        
        const { password: _, ...studentData } = student.toObject();

        res.json({ success: true, message: 'Login successful', token, student: studentData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error' });
    }
};

export const handleChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const studentId = req.user.id;

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const isMatch = await bcrypt.compare(oldPassword, student.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Old password incorrect' });

        student.password = await bcrypt.hash(newPassword, 10);
        await student.save();
        

        res.json({ success: true, Message: 'Password updated successfully!' })
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message || 'Internal server error'});
    }
}
