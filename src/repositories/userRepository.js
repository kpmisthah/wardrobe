import { User } from "../models/userSchema.js";

class UserRepository {
    async findByEmail(email) {
        return await User.findOne({ email });
    }

    async findById(id) {
        return await User.findById(id);
    }

    async findOne(filter) {
        return await User.findOne(filter);
    }

    async create(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async updateById(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, { new: true });
    }

    async updateOne(filter, updateData) {
        return await User.updateOne(filter, updateData);
    }
}

export default new UserRepository();
