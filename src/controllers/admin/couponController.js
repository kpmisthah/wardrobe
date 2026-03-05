import { Coupon } from "../../models/couponSchema.js";
import { HTTP_STATUS, MESSAGES } from "../../constants.js";
import { couponRepository } from "../../repositories/couponRepository.js";

const laodCoupon = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = 10;
    const skip = (page - 1) * limit;

    const coupon = await couponRepository.findCoupons(page, limit);
    const count = await couponRepository.countCoupons();
    const totalpages = Math.ceil(count / limit);

    return res.render("admin/coupon", {
      coupon,
      currentPage: page,
      totalpages
    });
  } catch (error) {
    console.log("The error is " + error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_ERROR);
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
    const couponExist = await couponRepository.findCouponByCode(code);
    if (couponExist) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MESSAGES.COUPON_EXISTS });
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
    res.status(HTTP_STATUS.OK).json({ message: MESSAGES.COUPON_ADDED });
  } catch (error) {
    console.log("The erro is " + error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_ERROR });
  }
};

const geteditCoupon = async (req, res) => {
  try {
    const { edit } = req.params;
    const coupon = await couponRepository.findCouponById(edit);
    return res.render("admin/edit-coupon", { coupon });
  } catch (error) {
    console.log("Ther error is" + error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send(MESSAGES.INTERNAL_ERROR);
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
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: MESSAGES.COUPON_NOT_FOUND });
    }
    return res.status(HTTP_STATUS.OK).json({ message: MESSAGES.COUPON_UPDATED });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.INTERNAL_ERROR });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await couponRepository.deleteCoupon(id);
    if (!coupon) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({ message: MESSAGES.COUPON_NOT_FOUND });
    }
    res.status(HTTP_STATUS.OK).json({ success: true, message: MESSAGES.COUPON_DELETED });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: MESSAGES.INTERNAL_ERROR });
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
