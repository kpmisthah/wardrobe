import { User } from "../../models/userSchema.js";
import { Product } from "../../models/productSchema.js";
import { Category } from "../../models/categoriesSchema.js";
import { Address } from "../../models/addressSchema.js";
import { Subcategory } from "../../models/subcategorySchema.js";
import { Order } from "../../models/orderIdSchema.js";
import bcrypt from "bcrypt";
import { Otp } from "../../models/otpModels.js";
import randomString from "randomstring";
import { Wishlist } from "../../models/wishlistSchema.js";
import { Wallet } from "../../models/walletSchema.js";
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";
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
    const category = await Category.find({ isListed: true })
    const categoryIds = category.map((cat => cat._id))
    const subcategory = await Subcategory.find({ isListed: true })
    const subcategoryIds = subcategory.map((sub => sub._id))

    const product = await Product.find({ isBlocked: false, category: categoryIds, subcategory: subcategoryIds })
      .sort({ createdAt: -1 })
      .limit(4);

    if (users) {
      const userData = await User.findOne({ _id: users });
      return res.render("user/home", {
        user: userData,
        menProducts,
        womenProducts,
        kidsProducts,
        product,
      });

    }

    return res.render("user/home", {
      menProducts,
      womenProducts,
      kidsProducts,
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
  }
};

//load Error page
const loadError = async (req, res) => {
  try {
    return res.render("user/pageNotFound");
  } catch (error) {
    console.log(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
  }
};

const loadShoppingPage = async (req, res) => {
  try {
    let page = parseInt(req.query.page || 1);
    const sortOption = req.query.sort || null;
    const searchQuery = req.query.search ? req.query.search.trim() : null;
    const price = req.query.price || null;
    const availability = req.query.availability || null;
    const categoryFilter = req.query.category ? req.query.category.trim() : null;

    let limit = 12;

    // Fetch all listed categories and subcategories to define the valid scope
    const categories = await Category.find({ isListed: true });
    const allCategoryIds = categories.map((cat) => cat._id);

    const subcategories = await Subcategory.find({ isListed: true });
    const allSubcategoryIds = subcategories.map((sub => sub._id));

    // Base query: only show listed/non-blocked items
    let query = {
      isBlocked: false,
      category: { $in: allCategoryIds },
      subcategory: { $in: allSubcategoryIds }
    };

    // 1. Apply Specific Category Filter
    if (categoryFilter) {
      const selectedCategory = await Category.findOne({
        name: { $regex: new RegExp("^" + categoryFilter + "$", "i") },
        isListed: true
      });

      if (selectedCategory) {
        // Overwrite the 'all categories' check with the specific one
        query.category = selectedCategory._id;
      }
    }

    // 2. Apply Search Filter
    if (searchQuery) {
      const searchCategories = await Category.find({
        name: { $regex: searchQuery, $options: "i" },
      });
      const searchCategoryIds = searchCategories.map((cat) => cat._id);

      // Search matches Name OR Description OR Category Name
      query.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
        { category: { $in: searchCategoryIds } },
      ];
    }

    // 3. Apply Price Filter
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

    // 4. Apply Availability Filter
    if (availability) {
      if (availability === "Available") {
        query = { ...query, isStock: true };
      } else if (availability === "Unavailable") {
        query = { ...query, isStock: false };
      }
    }

    // 5. sorting
    let sort = {};
    if (sortOption === "new") {
      sort = { createdAt: -1 };
    } else if (sortOption === "priceLowtoHigh") {
      sort = { salePrice: 1 };
    } else if (sortOption === "priceHightoLow") {
      sort = { salePrice: -1 };
    } else if (sortOption === "alphabetical") {
      sort = { name: 1 };
    } else if (sortOption === "reverseAlphabetical") {
      sort = { name: -1 };
    }

    // Execute Query
    const products = await Product.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sizeOptions")
      .populate("category");

    const count = await Product.countDocuments(query);
    const totalPages = Math.ceil(count / limit);

    // Update stock levels (keeping existing logic)
    for (let product of products) {
      if (product.sizeOptions && product.sizeOptions.length > 0) {
        const isStock = product.sizeOptions.some((option) => option.quantity > 0);
        if (isStock !== product.isStock) {
          product.isStock = isStock;
          await product.save();
        }
      }
    }

    const user = req.session.user;

    // Check for AJAX request
    const isAjax = req.xhr ||
      (req.headers.accept && req.headers.accept.indexOf('json') > -1) ||
      req.query.ajax === 'true';

    if (isAjax) {
      return res.status(StatusCodes.OK).json({
        products,
        totalPages, // Sent as 'totalPages' to match frontend expects
        currentPage: page,
        totalProducts: count
      });
    }

    const templateData = {
      products,
      totalpage: totalPages, // Sent as 'totalpage' for EJS loop
      page,
      sortOption,
      searchQuery,
      price,
      availability,
      category: categoryFilter
    };

    if (user) {
      const userData = await User.findOne({ _id: user });
      return res.render("user/shop", { ...templateData, user: userData });
    } else {
      return res.render("user/shop", templateData);
    }

  } catch (error) {
    console.log("Error in loadShoppingPage:", error);

    const isAjax = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || req.query.ajax === 'true';

    if (isAjax) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages.FAILED_LOAD_PRODUCTS });
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
  }
};

//load user Profile page
const loadProfile = async (req, res) => {
  try {
    const userId = req.session.user;
    const [userProfile, orders, wishlist, address, wallet] = await Promise.all([
      User.findOne({ _id: userId }),
      Order.find({ userId: userId }).sort({ createdAt: -1 }),
      Wishlist.findOne({ userId: userId }),
      Address.findOne({ userId: userId }),
      Wallet.findOne({ userId: userId })
    ]);

    const orderCount = orders ? orders.length : 0;
    const wishlistCount = wishlist && wishlist.items ? wishlist.items.length : 0;
    const addressCount = address && address.address ? address.address.length : 0;
    const walletBalance = wallet ? wallet.balance : 0;
    const recentOrders = orders ? orders.slice(0, 5) : [];

    return res.render("user/myaccount", {
      user: userProfile,
      orderCount,
      wishlistCount,
      addressCount,
      walletBalance,
      recentOrders
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.GENERAL_ERROR);
  }
};

//load users addAdress page

const addAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findById(userId);
    return res.render("user/addAddress", { user });
  } catch (error) {
    console.log(error);

  }
};

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
        .status(StatusCodes.OK)
        .json({ message: Messages.ADDRESS_ADDED });
    } else {
      const newAddress = new Address({
        userId: user,
        address: [newAddressData],
      });
      await newAddress.save();
      return res.status(StatusCodes.OK).json({ message: Messages.ADDRESS_ADDED });
    }
  } catch (error) {
    console.error("Error saving address:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: Messages.SERVER_ERROR });
  }
};

const getAddress = async (req, res) => {
  try {
    const userId = req.session.user;
    const user = await User.findById(userId);
    const existingAddress = await Address.findOne({ userId });
    if (!existingAddress) {
      return res.render("user/getAddress", { user, address: [] });
    }
    return res.render("user/getAddress", { user, address: existingAddress.address });
  } catch (error) {
    console.log("The error is" + error);
  }
};

const getEditPage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session.user;
    const user = await User.findById(userId);
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
    return res.render("user/edit-address", { user, address });
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
    res.status(StatusCodes.OK).json({ message: Messages.DATA_UPDATED });
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
      return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.ADDRESS_NOT_FOUND });
    }
    return res.status(StatusCodes.OK).json({ message: Messages.ADDRESS_DELETED });
  } catch (error) {
    console.log("The error is" + error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.session.user;
    console.log("Updating profile for user ID:", userId);
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for ID:", userId);
      return res.redirect('/login');
    }
    return res.render("user/updateProfile", { user, userData: user });
  } catch (error) {
    console.log("The error is" + error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(Messages.SERVER_ERROR);
  }
};

const profileUpdate = async (req, res) => {
  try {
    const userId = req.session.user;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.USER_NOT_FOUND });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.INCORRECT_PASSWORD });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(StatusCodes.OK).json({ message: Messages.PASSWORD_UPDATED });

  } catch (error) {
    console.log("The error is" + error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
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
  try {
    const userId = req.session.user;
    const previousMail = await User.findOne({ _id: userId });
    const oldEmail = previousMail.email;
    const { otps } = req.body;
    const otpRecord = await Otp.findOne({ email: oldEmail });
    if (!otpRecord) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: Messages.OTP_EXPIRED });
    }
    if (otpRecord.otp != otps) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: Messages.INVALID_OTP });
    }
    if (!req.session.updateProfile) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: Messages.SESSION_EXPIRED });
    }
    const { email, password } = req.session.updateProfile;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use findByIdAndUpdate alone, OR find + save. Do not mix.
    await User.findByIdAndUpdate(userId, {
      email: email,
      password: hashedPassword,
    });

    // Clear the temp session data
    delete req.session.updateProfile;

    return res
      .status(StatusCodes.OK)
      .json({
        success: true,
        message: Messages.PASSWORD_UPDATED,
        redirectUrl: "/updateProfile",
      });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: Messages.VERIFICATION_ERROR });
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
};


//...............................................
