import { Otp } from "../models/otpModels.js";

class OtpRepository {
    async create(otpData) {
        return await Otp.create(otpData);
    }

    async findOne(filter) {
        return await Otp.findOne(filter);
    }

    async findLatestByEmail(email) {
        return await Otp.findOne({ email }).sort({ createdAt: -1 });
    }

    async findOneAndUpdate(filter, updateData, options = { upsert: true, new: true }) {
        return await Otp.findOneAndUpdate(filter, updateData, options);
    }
}

export default new OtpRepository();
