import { User } from "../../models/userSchema.js";
import { Product } from "../../models/productSchema.js";
import { Category } from "../../models/categoriesSchema.js";
import { Address } from "../../models/addressSchema.js";
import { Order } from "../../models/orderIdSchema.js";
import bcrypt from "bcrypt";
import { Otp } from "../../models/otpModels.js";
import randomString from "randomstring";
// import { sendEmail } from "../../utils/sendEmail.js";

//load Home page
const loadHome = async (req, res) => {
    try {
      const users = req.session.user;
  
      const [menCategory, womenCategory, kidsCategory] = await Promise.all([
        Category.findOne({ name: "men", isListed: true }),
        Category.findOne({ name: "women", isListed: true }),
        Category.findOne({ name: "kids", isListed: true }),
      ]);
  
      const [menProducts, womenProducts, kidsProducts] = await Promise.all([
        menCategory
          ? Product.find({ category: menCategory._id, isBlocked: false }).limit(1)
          : [],
        womenCategory
          ? Product.find({ category: womenCategory._id, isBlocked: false }).limit(
              1
            )
          : [],
        kidsCategory
          ? Product.find({ category: kidsCategory._id, isBlocked: false }).limit(
              1
            )
          : [],
      ]);
  
      const product = await Product.find({ isBlocked: false })
        .sort({ createdAt: -1 })
        .limit(4);
  
      if (users) {
        const userData = await User.findOne({ _id: users });
        if (userData.isBlocked) {
          req.session.destroy();
          return res.redirect("/login");
        } else {
   
          return res.render("user/home", {
            user: userData,
            menProducts,
            womenProducts,
            kidsProducts,
            product,
          });
        }
      }
  
      return res.render("user/home", {
        menProducts,
        womenProducts,
        kidsProducts,
        product,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send("Server error");
    }
  };
    
//load Error page
const loadError = async (req, res) => {
  try {
    return res.render("user/pageNotFound");
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server error");
  }
};

const loadShoppingPage = async (req, res) => {
  try {
    let page = parseInt(req.query.page || 1);
    const sortOption = req.query.sort || null;
    const searchQuery = req.query.search || null;
    const price = req.query.price || null;
    const availability = req.query.availability || null;
    let limit = 12;
    let query = { isBlocked: false };
    let sort = {};

    if (searchQuery) {
      // First find categories that match the search query
      const categories = await Category.find({
        name: { $regex: searchQuery, $options: "i" },
      });

      const categoryIds = categories.map((cat) => cat._id);

      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { category: { $in: categoryIds } },
      ];
    }

    // Rest of your existing price and availability filters
    if (price) {
      if (price === "below-1500") {
        query = { ...query, salePrice: { $lt: 1500 } };
      } else if (price === "1500-2000") {
        query = { ...query, salePrice: { $gte: 1500, $lte: 2000 } };
      } else if (price === "2000-2500") {
        query = { ...query, salePrice: { $gte: 2000, $lte: 2500 } };
      } else if (price === "2500-3000") {
        query = { ...query, salePrice: { $gte: 2500, $lte: 3000 } };
      } else if (price === "3000-4000") {
        query = { ...query, salePrice: { $gte: 3000, $lte: 4000 } };
      } else if (price === "Above4000") {
        query = { ...query, salePrice: { $gt: 4000 } };
      }
    }

    if (availability) {
      if (availability == "Available") {
        query = { ...query, isStock: true };
      } else if (availability == "Unavailable") {
        query = { ...query, isStock: false };
      }
    }

    // Sort options using if-else blocks
    if (sortOption === "default") {
      sort = {};
    } else if (sortOption === "new") {
      sort = { createdAt: -1 };
    } else if (sortOption === "priceLowtoHigh") {
      sort = { salePrice: 1 };
    } else if (sortOption === "priceHightoLow") {
      sort = { salePrice: -1 };
    } else if (sortOption === "alphabetical") {
      sort = { name: 1 };
    } else if (sortOption === "reverseAlphabetical") {
      sort = { name: -1 };
    } else {
      sort = {};
    }
    // Add population for category
    let products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sizeOptions")
      .populate("category");

    const count = await Product.countDocuments(query);
    const totalpage = Math.ceil(count / limit);

    // Update stock status
    for (let product of products) {
      const isStock = product.sizeOptions.some((option) => option.quantity > 0);
      if (isStock !== product.isStock) {
        product.isStock = isStock;
        await product.save();
      }
    }

    let user = req.session.user;
    if (user) {
      let userData = await User.findOne({ _id: user });
      return res.render("user/shop", {
        user: userData,
        products,
        totalpage,
        page,
        sortOption,
        searchQuery,
      });
    } else {
      return res.render("user/shop", {
        products,
        totalpage,
        page,
        sortOption,
        searchQuery,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

//load user Profile page
const loadProfile = async (req, res) => {
  try {
    const users = req.session.user;
    const userProfile = await User.findOne({ _id: users });
    return res.render("user/myaccount", { user: userProfile });
  } catch (error) {
    return res.status(500).send("An error occurred");
  }
};

//load users addAdress page

const addAddress = async (req, res) => {
  try {
    return res.render("user/addAddress");
  } catch (error) {}
};

//post the address into address page
//user id session eduth store cheyth
const address = async (req, res) => {
  try {
    const user = req.session.user;
    const formData = req.body;
    const userAddress = await Address.findOne({ userId: user });

    const newAddressData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      zipCode: formData.zipCode,
      state: formData.state,
      houseNumber: formData.houseNumber,
      district: formData.district,
    };
    if (userAddress) {
      userAddress.address.push(newAddressData);
      await userAddress.save();
      return res
        .status(200)
        .json({ message: "Address is addedd successfully" });
    } else {
      const newAddress = new Address({
        userId: user,
        address: [newAddressData],
      });
      await newAddress.save();
      return res.status(200).json({ message: "Address added successfully" });
    }
  } catch (error) {
    console.error("Error saving address:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const existingAddress = await Address.findOne({ userId });
    if (!existingAddress) {
      return res.render("user/getAddress", { address: [] });
    }
    return res.render("user/getAddress", { address: existingAddress.address });
  } catch (error) {
    console.log("The error is" + error);
  }
};

const getEditPage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user;
    const userAddress = await Address.findOne({ userId });
    if (!userAddress) {
      return res.redirect("/getAddress");
    }
    const address = userAddress.address.find(
      (addr) => addr._id.toString() === id
    );
    if (!address) {
      return res.redirect("/getAddress");
    }
    return res.render("user/edit-address", { address });
  } catch (error) {
    console.log("Error in get eidt page", error);
  }
};

const edit = async (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;
    const data = req.body;
    await Address.updateOne(
      { userId: user, "address._id": id },
      {
        $set: {
          "address.$.name": data.name,
          "address.$.email": data.email,
          "address.$.phone": data.phone,
          "address.$.city": data.city,
          "address.$.zipCode": data.zipCode,
          "address.$.houseNumber": data.houseNumber,
          "address.$.district": data.district,
          "address.$.state": data.state,
        },
      }
    );
    res.status(200).json({ message: "data updated successfully" });
  } catch (error) {
    console.log("somethig went wrong", error);
  }
};

const deleteAddress = async (req, res) => {
  try {
    const user = req.session.user;
    const { id } = req.params;
    const address = await Address.findOneAndUpdate(
      { userId: user },
      { $pull: { address: { _id: id } } },
      { new: true }
    );
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }
    return res.status(200).json({ message: "address deleted successfully" });
  } catch (error) {
    console.log("The error is" + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    return res.render("user/updateProfile", { userData });
  } catch (error) {
    console.log("The error is" + error);
  }
};

const profileUpdate = async (req, res) => {
  try {
    const userId = req.session.user;
    const previousMail = await User.findOne({ _id: userId });
    const oldEmail = previousMail.email;
    const { email, password } = req.body;
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    console.log("The new otp is" + otp);
    await Otp.create({ email: oldEmail, otp });
    req.session.updateProfile = { email, password };
    return res
      .status(200)
      .json({ message: "OTP sent to your current email address." });
  } catch (error) {
    console.log("The error is" + error);
  }
};

const otpVerification = async (req, res) => {
  try {
    return res.render("user/update-otp-verification");
  } catch (error) {
    console.log("otp error" + error);
  }
};

const verifyOtps = async (req, res) => {
  console.log("hello from verifyotps");
  try {
    const userId = req.session.user;
    const previousMail = await User.findOne({ _id: userId });
    const oldEmail = previousMail.email;
    const { otps } = req.body;
    const otpRecord = await Otp.findOne({ email: oldEmail });
    console.log("The record is " + otpRecord);
    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired or is invalid." });
    }
    if (otpRecord.otp != otps) {
      return res.status(400).json({ success: false, message: "Invalid OTP." });
    }
    const { email, password } = req.session.updateProfile;
    const hashedPassword = await bcrypt.hash(password, 10);
    const updateUser = await User.findByIdAndUpdate(userId, {
      email: email,
      password: hashedPassword,
    });
    console.log("The updated user is " + updateUser);
    await updateUser.save();
    return res
      .status(200)
      .json({
        success: true,
        message: "OTP verified successfully.",
        redirectUrl: "/updateProfile",
      }); // Example redirect URL
  } catch (error) {
    console.log("the errorr is" + error);
    return res
      .status(500)
      .json({ success: false, message: "An error occured" });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = randomString.generate({ length: 6, charset: "numeric" });
    const existingOtp = await Otp.findOneAndUpdate(
      { email },
      { otp },
      { upsert: true, new: true }
    );
    console.log("The otp is " + existingOtp);

    return res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error while resending OTP:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again later.",
      });
  }
};

export {
  loadHome,
  loadError,
  loadShoppingPage,
  loadProfile,
  updateProfile,
  getAddress,
  addAddress,
  address,
  getEditPage,
  edit,
  deleteAddress,
  profileUpdate,
  otpVerification,
  verifyOtps,
  resendOtp,
};
