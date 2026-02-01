import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    enrollment: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment', required: true },

    tuitionFee: { type: Number, required: true },
    discountApplied: { type: Number, min: 0, max: 1, default: 0 },
    miscFees: {
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
    },
    totalAmount: { type: Number },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: [ "pending", "completed", "failed", "overdue" ], default: 'pending' },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },

    transactions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }],

    schoolYear: { type: String, required: true },

}, { timestamps: true });


// Pre-save hook (new documents)
paymentSchema.pre('save', async function() {
    const miscTotal = Object.values(this.miscFees || {}).reduce((sum, fee) => sum + fee, 0);
    const discountedTuition = this.tuitionFee * (1 - (this.discountApplied || 0));

    this.totalAmount = discountedTuition + miscTotal;
    // next();
});

// Pre-update hook (findOneAndUpdate)
paymentSchema.pre('findOneAndUpdate', async function() {
    const update = this.getUpdate();

    if (update.tuitionFee !== undefined || update.miscFees !== undefined || update.discountApplied !== undefined) {
        const docToUpdate = await this.model.findOne(this.getQuery());
        
        const tuitionFee = update.tuitionFee ?? docToUpdate.tuitionFee;
        const miscFees = update.miscFees ?? docToUpdate.miscFees;
        const miscTotal = Object.values(miscFees || {}).reduce((sum, fee) => sum + fee, 0);

        const discountApplied = update.discountApplied ?? docToUpdate.discountApplied;
        const discountedTuition = tuitionFee * (1 - discountApplied);

        update.totalAmount = discountedTuition + miscTotal;
        this.setUpdate(update);
    }
});


const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;