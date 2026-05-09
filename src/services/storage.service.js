import imageKit from "@imagekit/nodejs";
import { config } from "../configs/config.js";

const imageKitInstance = new imageKit({
  privateKey: config.IMG_KIT_PRIV_KEY,
});

/**
 * @param {Buffer} file - File buffer to upload
 * @returns {Promise<{url: string, fileId: string}>}
 */
export const uploadFile = async (file) => {
  const result = await imageKitInstance.files.upload({
    file: file,
    fileName: "Product-" + Date.now(),
    folder: "Products",
  });
  return result;
};
/**
 * File delete function from Imagekit
 * @param {string} fileId - ImageKit ki unique fileId
 */
export const deleteFile = async (fileId) => {
  try {
    if (!fileId) return;
    console.log("Attempting to delete file with ID:", fileId);
    const result = await imageKitInstance.files.delete(fileId);
    console.log("ImageKit Response:", result);

    console.log(`Image deleted successfully: ${fileId}`);
    return result;
  } catch (error) {
    console.error("ImageKit Delete Error:", error.message);

    return null;
  }
};
