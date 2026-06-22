import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({
  path: ".env",
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const uploadSingleImage = async (image: string, folder_name: string) => {
  const res = await cloudinary.uploader.upload(image, {
    folder: folder_name,
  });

  return {
    image_url: res.secure_url,
    public_alt: res.public_id,
  };
};

export const deleteImage = async (public_alt: string) => {
  const res = await cloudinary.uploader.destroy(public_alt);
  return res?.result === "ok";
};
