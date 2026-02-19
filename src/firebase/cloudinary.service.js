// src/firebase/cloudinary.service.js

export async function uploadToCloudinary(file) {
  if (!file) throw new Error("No file selected");

  // 🔒 Basic validation
  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  // Limit file size (5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Image must be under 5MB");
  }

  const cloudName = "dndu5nglm";
  const uploadPreset = "scentbase_unsigned";

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  // 👇 Store inside organized folder
  formData.append("folder", "scentbase/products");

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error:", errorText);
      throw new Error("Image upload failed");
    }

    const data = await response.json();

    // 🔥 Optimized ecommerce image URL
    const optimizedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/w_900,h_900,c_fill,g_auto,q_auto,f_auto/"
    );

    return {
      url: optimizedUrl,
      publicId: data.public_id,
    };

  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
