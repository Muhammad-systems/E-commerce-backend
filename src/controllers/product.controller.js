import { productModel } from "../models/product.model.js";
import { createProductValidate } from "../validations/validation.js";
import { uploadFile,deleteFile } from "../services/storage.service.js";

export const createProduct = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }
    const dataToValidate = {
      ...req.body,
      price: Number(req.body.price),
      stock: Number(req.body.stock),
      images: req.files ? req.files.map((file) => file.originalname) : [],
    };
    console.log(dataToValidate);
    const result = createProductValidate.safeParse(dataToValidate);
    if (!result.success)
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });

    const { title, description, category, price, stock } = result.data;

    const imgeUrls = [];
    for (const file of req.files) {
      const base64File = file.buffer.toString("base64");
      const response = await uploadFile(base64File, file.originalname);
      console.log("ImageKit Response Check:", response.fileId)
      imgeUrls.push({url:response.url,
                    fileId:response.fileId});
    }
    const product = await productModel.create({
      title,
      description,
      category,
      price,
      stock,
      images: imgeUrls,
    });

    return res.status(201).json({
      success: true,
      message: "Product created",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error " + error.message,
    });
  }
};

export const getAllProduct = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;
    const product = await productModel
      .find()
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await productModel.countDocuments();

    return res.status(200).json({
      success: true,
      message: "All Products",
      product,
      totalProduct: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error " + error.message,
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateProductValidate = createProductValidate.partial();
    const dataToValidate = { ...req.body };
    if (dataToValidate.price)
      dataToValidate.price = Number(dataToValidate.price);
    if (dataToValidate.stock)
      dataToValidate.stock = Number(dataToValidate.stock);

    const result = updateProductValidate.safeParse(dataToValidate);
    if (!result.success)
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    const updateData = result.data;
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const response = await uploadFile(
          file.buffer.toString("base64"),
          file.originalname,
        );
        imageUrls.push({url:response.url,fileId:response.fileId});
      }
      updateData.images = imageUrls;
    }

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await productModel.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.images && Array.isArray(product.images)) {
      for (const img of product.images) {
        if (img.fileId) {
          await deleteFile(img.fileId); 
        }
      }
    }

    await productModel.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Product and its images deleted successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error: " + error.message,
    });
  }
};