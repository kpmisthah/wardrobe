import { Coupon } from "../../models/couponSchema.js";

const laodCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.find();
    return res.render("admin/coupon", { coupon });
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
      return res.status(400).json({ message: "coupon is already exist" });
    }
    const newCoupon = new Coupon({
      code,
      discountValue: parseFloat(discountValue),
      minPurchase: Number(minPurchase),
      startDate,
      endDate,
      discountType,
      maxDiscount:Number(maxDiscount)
    });
    await newCoupon.save();
    res.status(200).json({ message: "coupon is added successfully" });
  } catch (error) {
    console.log("The erro is " + error);
    res.status(500).json({ message: "internal server error" });
  }
};

const geteditCoupon = async (req, res) => {
  try {
    const { edit } = req.params;
    const coupon = await Coupon.findOne({ _id: edit });
    return res.render("admin/edit-coupon", { coupon });
  } catch (error) {
    console.log("Ther error is" + error);
  }
};
const editCoupon = async (req, res) => {
  try {
    const { edit } = req.params;
    const {code,discountValue,minPurchase,startDate,endDate,discountType} = req.body;

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
      return res.status(404).json({ message: "Coupon not found" });
    }
    return res.status(200).json({ message: "coupon updated successfully" });
  } catch (error) {}
};

const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return res.status(401).json({ message: "coupom is not found" });
    }
    res.status(200).json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
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
