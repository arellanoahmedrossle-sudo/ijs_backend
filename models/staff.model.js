import mongoose from "mongoose";
import bcrypt from "bcrypt";

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactNumber: { type: String, default: 'NA' },
  role: { type: String, enum: ['cashier', 'admin'], required: true },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

// Pre-save hook for password hashing
staffSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Staff = mongoose.model("Staff", staffSchema);

export default Staff;
