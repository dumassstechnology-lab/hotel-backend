import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "hotel-booking";

    // ===== USER IMAGES =====
    if (file.fieldname === "profileImage") {
      folder += "/users/profile";
    }

    if (file.fieldname === "idFront" || file.fieldname === "idBack") {
      folder += "/users/national-id";
    }

    // ===== HOTEL IMAGES =====
    else if (req.body.hotelId) {
      folder += `/hotels/${req.body.hotelId}/rooms`;
    } else if (file.fieldname === "hotelImage") {
      folder += "/hotels";
    }

    return {
      folder,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: `${Date.now()}-${file.originalname}`
    };
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export default upload;