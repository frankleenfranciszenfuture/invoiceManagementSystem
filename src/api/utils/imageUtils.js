const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const API_ROOT = API_BASE_URL.endsWith("/api/v1.0")
  ? API_BASE_URL
  : `${API_BASE_URL}/api/v1.0`;

export const getImageUrl = (imageUrl, folder = "products") => {
  if (!imageUrl) {
    return "";
  }

  // Backend already returned complete URL
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Backend returned only filename
  return `${API_ROOT}/uploads/${folder}/${imageUrl}`;
};
