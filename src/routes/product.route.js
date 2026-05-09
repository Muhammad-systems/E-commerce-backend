import express from "express";
import {
  createProduct,
  getAllProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";
import { isAdmin } from "../middlewares/admin.auth.middleware.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

/** Product management routes */
export const productRouter = express.Router();

productRouter.post(
  "/create-product",
  isAdmin,
  upload.array("images"),
  createProduct,
);
productRouter.get("/", getAllProduct);
productRouter.patch(
  "/update-product/:id",
  isAdmin,
  upload.array("images"),
  updateProduct,
);
productRouter.delete("/delete-product/:id", isAdmin, deleteProduct);
