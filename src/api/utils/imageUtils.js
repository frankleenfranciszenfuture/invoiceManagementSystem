const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const API_ROOT = API_BASE_URL.endsWith("/api/v1.0")
  ? API_BASE_URL
  : `${API_BASE_URL}/api/v1.0`;

/* =========================================================
   GET IMAGE URL
========================================================= */

export const getImageUrl = (imageUrl, folder = "products") => {
  if (!imageUrl) {
    return "";
  }

  /* =====================================================
       BACKEND ALREADY RETURNED COMPLETE URL
    ===================================================== */

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  /* =====================================================
       BACKEND RETURNED ONLY FILENAME
    ===================================================== */

  return `${API_ROOT}/uploads/${folder}/${imageUrl}`;
};

/* =========================================================
   COMPANY LOGO
========================================================= */

export const getCompanyLogoUrl = (logo) => {
  return getImageUrl(logo, "companies/logo");
};

/* =========================================================
   COMPANY SIGNATURE
========================================================= */

export const getCompanySignatureUrl = (signature) => {
  return getImageUrl(signature, "companies/signature");
};
