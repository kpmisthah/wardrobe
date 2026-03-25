import { Coupon } from "../../models/couponSchema.js";
import { StatusCodes } from "../../utils/enums.js";
import { Messages } from "../../utils/messages.js";

const laodCoupon = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 10;
    const skip = (page - 1) * limit;

    const coupon = await Coupon.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const count = await Coupon.countDocuments();
    const totalpages = Math.ceil(count / limit);

    return res.render("admin/coupon", {
      coupon,
      currentPage: page,
      totalpages
    });
  } catch (error) {
    console.log("The error is " + error);
  }
};

const addcoupon = async (req, res) => {
  try {
    return res.render("admin/couponAdd");
  } catch (error) {
    console.log(error);
  }
};

const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountValue,
      minPurchase,
      startDate,
      endDate,
      isActive,
      discountType,
      maxDiscount
    } = req.body;
    const couponExist = await Coupon.findOne({ code });
    if (couponExist) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: Messages.COUPON_EXISTS });
    }
    const newCoupon = new Coupon({
      code,
      discountValue: parseFloat(discountValue),
      minPurchase: Number(minPurchase),
      startDate,
      endDate,
      discountType,
      maxDiscount: Number(maxDiscount)
    });
    await newCoupon.save();
    res.status(StatusCodes.OK).json({ message: Messages.COUPON_ADDED });
  } catch (error) {
    console.log("The error is " + error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

const geteditCoupon = async (req, res) => {
  try {
    const { edit } = req.params;
    const coupon = await Coupon.findOne({ _id: edit });
    return res.render("admin/edit-coupon", { coupon });
  } catch (error) {
    console.log("The error is" + error);
  }
};

const editCoupon = async (req, res) => {
  try {
    const { edit } = req.params;
    const { code, discountValue, minPurchase, startDate, endDate, discountType } = req.body;

    const updateCoupon = await Coupon.findByIdAndUpdate(
      edit,
      {
        code,
        discountValue,
        minPurchase,
        startDate,
        endDate,
        discountType,
      },
      { new: true }
    );

    if (!updateCoupon) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.COUPON_NOT_FOUND });
    }
    return res.status(StatusCodes.OK).json({ message: Messages.COUPON_UPDATED });
  } catch (error) {
    console.log("The error is" + error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: Messages.SERVER_ERROR });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: Messages.COUPON_NOT_FOUND });
    }
    res.status(StatusCodes.OK).json({ success: true, message: Messages.COUPON_DELETED });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: Messages.SERVER_ERROR });
  }
};

export {
  laodCoupon,
  addcoupon,
  createCoupon,
  editCoupon,
  geteditCoupon,
  deleteCoupon,
};
