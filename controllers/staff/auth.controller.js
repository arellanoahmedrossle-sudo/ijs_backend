import Staff from "../../models/staff.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Generate JWT
const generateToken = (staff) => {
  return jwt.sign(
    { id: staff._id, role: staff.role, username: staff.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

// Register Staff
export const registerStaff = async (req, res) => {
  try {
    const { username, fullName, password, email, contactNumber, role } = req.body;

    // Check if user exists
    const existing = await Staff.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }

    const staff = new Staff({ username, fullName, password, email, contactNumber, role });
    await staff.save();

    const token = generateToken(staff);

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      staff: { id: staff._id, username: staff.username, role: staff.role },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Login Staff
export const loginStaff = async (req, res) => {
  try {
    const { username, password } = req.body;

    const staff = await Staff.findOne({ username });
    if (!staff) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await staff.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    staff.lastLogin = new Date();
    await staff.save();

    const token = generateToken(staff);

    res.status(200).json({
      success: true,
      message: "Login successful",
      staff: { id: staff._id, username: staff.username, role: staff.role },
      token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
