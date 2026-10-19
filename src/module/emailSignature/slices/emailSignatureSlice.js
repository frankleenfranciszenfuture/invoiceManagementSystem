import { createSlice } from "@reduxjs/toolkit";

import {
  fetchAllEmailSignatures,
  fetchEmailSignaturesById,
  createEmailSignature,
  updateEmailSignature,
  setDefaultForNew,
  setDefaultForReplies,
  deleteEmailSignature,
} from "../thunks/emailSignatureThunks";

/* =========================================================
   EMPTY EMAIL SIGNATURE FORM
   ========================================================= */

const emptyEmailSignature = {
  id: null,
  userId: null,
  signatureName: "",
  signatureContent: "",
  defaultForNewMessages: false,
  defaultForReplies: false,
  status: "ACTIVE",
};

/* =========================================================
   INITIAL STATE
   ========================================================= */

const initialState = {
  emailSignatures: [],

  // Form and currently loaded signature
  emailSignature: { ...emptyEmailSignature },

  // Previously selected signature
  existingEmailSignature: null,

  // Pagination returned by API
  pagination: {
    pageNumber: 0,
    pageSize: 20,
    totalElements: 0,
    totalPages: 0,
    last: true,
  },

  loading: false,
  success: false,
  error: null,
  message: "",

  // Selected signature for preview/details
  selectedEmailSignatureView: null,
};

/* =========================================================
   RESPONSE HELPERS
   ========================================================= */

const getResponseData = (payload) => payload?.data ?? payload;

const getSignatureFromResponse = (payload) => {
  const data = getResponseData(payload);

  // Supports a single signature or a paginated response
  if (data && !Array.isArray(data) && !data.content) {
    return data;
  }

  return null;
};

const getErrorMessage = (action, fallback) =>
  action.payload || action.error?.message || fallback;

/* =========================================================
   SLICE
   ========================================================= */

const emailSignatureSlice = createSlice({
  name: "emailSignatures",
  initialState,

  reducers: {
    /* =============================================
           SET EXISTING EMAIL SIGNATURE
           ============================================= */

    setExistingEmailSignature: (state, action) => {
      state.existingEmailSignature = action.payload;
    },

    /* =============================================
           CLEAR ERROR
           ============================================= */

    clearEmailSignatureError: (state) => {
      state.error = null;
    },

    /* =============================================
           CLEAR ALL EMAIL SIGNATURE STATE
           ============================================= */

    clearEmailSignatureState: (state) => {
      state.emailSignatures = [];
      state.emailSignature = { ...emptyEmailSignature };
      state.existingEmailSignature = null;

      state.pagination = {
        pageNumber: 0,
        pageSize: 20,
        totalElements: 0,
        totalPages: 0,
        last: true,
      };

      state.loading = false;
      state.success = false;
      state.error = null;
      state.message = "";
      state.selectedEmailSignatureView = null;
    },

    /* =============================================
           CLEAR SELECTED EMAIL SIGNATURE
           ============================================= */

    clearSelectedEmailSignature: (state) => {
      state.emailSignature = { ...emptyEmailSignature };
      state.existingEmailSignature = null;
    },

    /* =============================================
           RESET EMAIL SIGNATURE FORM
           ============================================= */

    resetEmailSignatureForm: (state) => {
      state.emailSignature = { ...emptyEmailSignature };
      state.existingEmailSignature = null;
    },

    /* =============================================
           SET FORM FIELD
           ============================================= */

    setEmailSignatureField: (state, action) => {
      const { field, value } = action.payload;

      state.emailSignature = {
        ...(state.emailSignature || INITIAL_FOR),
        [field]: value,
      };
    },

    /* =============================================
           SET SELECTED SIGNATURE VIEW
           ============================================= */

    setSelectedEmailSignatureView: (state, action) => {
      state.selectedEmailSignatureView = action.payload;
    },

    /* =============================================
           UPDATE SIGNATURE DEFAULT FLAGS LOCALLY
           ============================================= */

    setEmailSignatureDefaultLocally: (state, action) => {
      const { id, defaultForNewMessages, defaultForReplies } = action.payload;

      const signature = state.emailSignatures.find((item) => item.id === id);

      if (signature) {
        if (defaultForNewMessages !== undefined) {
          signature.defaultForNewMessages = defaultForNewMessages;
        }

        if (defaultForReplies !== undefined) {
          signature.defaultForReplies = defaultForReplies;
        }
      }
    },
  },

  /* =====================================================
       EXTRA REDUCERS
       ===================================================== */

  extraReducers: (builder) => {
    /* =============================================
           FETCH ALL EMAIL SIGNATURES
           Response: data.content + pagination
           ============================================= */

    builder
      .addCase(fetchAllEmailSignatures.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchAllEmailSignatures.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const response = action.payload;
        const data = response?.data;

        state.emailSignatures = data?.content ?? [];

        state.pagination = {
          pageNumber: data?.pageNumber ?? 0,
          pageSize: data?.pageSize ?? 20,
          totalElements: data?.totalElements ?? 0,
          totalPages: data?.totalPages ?? 0,
          last: data?.last ?? true,
        };

        state.message = response?.message ?? "";
      })

      .addCase(fetchAllEmailSignatures.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = getErrorMessage(
          action,
          "Failed to fetch email signatures.",
        );
        state.message = "";
      });

    /* =============================================
           FETCH EMAIL SIGNATURE BY ID
           ============================================= */

    builder
      .addCase(fetchEmailSignaturesById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(fetchEmailSignaturesById.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;

        const signature = getSignatureFromResponse(action.payload);

        if (signature) {
          state.emailSignature = signature;
          state.existingEmailSignature = signature;
        }

        state.message = action.payload?.message ?? "";
      })

      .addCase(fetchEmailSignaturesById.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = getErrorMessage(
          action,
          "Failed to fetch email signature.",
        );
        state.message = "";
      });

    /* =============================================
           CREATE EMAIL SIGNATURE
           ============================================= */

    builder
      .addCase(createEmailSignature.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(createEmailSignature.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message =
          action.payload?.message || "Email signature created successfully.";

        const newSignature = getSignatureFromResponse(action.payload);

        if (newSignature) {
          state.emailSignature = newSignature;
          state.existingEmailSignature = newSignature;

          const index = state.emailSignatures.findIndex(
            (item) => item.id === newSignature.id,
          );

          if (index === -1) {
            state.emailSignatures.unshift(newSignature);
            state.pagination.totalElements += 1;
          } else {
            state.emailSignatures[index] = newSignature;
          }
        }
      })

      .addCase(createEmailSignature.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = getErrorMessage(
          action,
          "Failed to create email signature.",
        );
        state.message = "";
      });

    /* =============================================
           UPDATE EMAIL SIGNATURE
           ============================================= */

    builder
      .addCase(updateEmailSignature.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
        state.message = "";
      })

      .addCase(updateEmailSignature.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message =
          action.payload?.message || "Email signature updated successfully.";

        const updatedSignature = getSignatureFromResponse(action.payload);

        if (updatedSignature) {
          state.emailSignature = updatedSignature;
          state.existingEmailSignature = updatedSignature;

          const index = state.emailSignatures.findIndex(
            (item) => item.id === updatedSignature.id,
          );

          if (index !== -1) {
            state.emailSignatures[index] = updatedSignature;
          }
        }
      })

      .addCase(updateEmailSignature.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = getErrorMessage(
          action,
          "Failed to update email signature.",
        );
        state.message = "";
      });

    /* =============================================
           SET DEFAULT FOR NEW MESSAGES
           ============================================= */

    builder
      .addCase(setDefaultForNew.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(setDefaultForNew.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message =
          action.payload?.message ||
          "Default signature for new messages updated.";

        const updatedSignature = getSignatureFromResponse(action.payload);

        if (updatedSignature) {
          const index = state.emailSignatures.findIndex(
            (item) => item.id === updatedSignature.id,
          );

          if (index !== -1) {
            state.emailSignatures[index] = updatedSignature;
          }

          if (state.emailSignature.id === updatedSignature.id) {
            state.emailSignature = updatedSignature;
          }

          state.existingEmailSignature = updatedSignature;
        } else {
          // Fallback if the API returns only a success message.
          const { id, data } = action.meta.arg;

          state.emailSignatures = state.emailSignatures.map((item) => ({
            ...item,
            defaultForNewMessages: item.id === id ? data.enabled : false,
          }));
        }
      })

      .addCase(setDefaultForNew.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = getErrorMessage(
          action,
          "Failed to update default signature for new messages.",
        );
      });

    /* =============================================
           SET DEFAULT FOR REPLIES
           ============================================= */

    builder
      .addCase(setDefaultForReplies.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      .addCase(setDefaultForReplies.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message =
          action.payload?.message || "Default signature for replies updated.";

        const updatedSignature = getSignatureFromResponse(action.payload);

        if (updatedSignature) {
          const index = state.emailSignatures.findIndex(
            (item) => item.id === updatedSignature.id,
          );

          if (index !== -1) {
            state.emailSignatures[index] = updatedSignature;
          }

          if (state.emailSignature.id === updatedSignature.id) {
            state.emailSignature = updatedSignature;
          }

          state.existingEmailSignature = updatedSignature;
        } else {
          // Fallback if the API returns only a success message.
          const { id, data } = action.meta.arg;

          state.emailSignatures = state.emailSignatures.map((item) => ({
            ...item,
            defaultForReplies: item.id === id ? data.enabled : false,
          }));
        }
      })

      .addCase(setDefaultForReplies.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = getErrorMessage(
          action,
          "Failed to update default signature for replies.",
        );
      });

    /* =============================================
           DELETE EMAIL SIGNATURE
           ============================================= */

    builder
      .addCase(deleteEmailSignature.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })

      .addCase(deleteEmailSignature.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        state.message =
          action.payload?.message || "Email signature deleted successfully.";

        const deletedId = action.meta.arg;

        state.emailSignatures = state.emailSignatures.filter(
          (item) => item.id !== deletedId,
        );

        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }

        if (state.emailSignature.id === deletedId) {
          state.emailSignature = {
            ...emptyEmailSignature,
          };
        }

        if (state.existingEmailSignature?.id === deletedId) {
          state.existingEmailSignature = null;
        }

        if (state.selectedEmailSignatureView?.id === deletedId) {
          state.selectedEmailSignatureView = null;
        }
      })

      .addCase(deleteEmailSignature.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = getErrorMessage(
          action,
          "Failed to delete email signature.",
        );
        state.message = "";
      });
  },
});

/* =========================================================
   ACTIONS
   ========================================================= */

export const {
  setExistingEmailSignature,
  clearEmailSignatureError,
  clearEmailSignatureState,
  clearSelectedEmailSignature,
  resetEmailSignatureForm,
  setEmailSignatureField,
  setSelectedEmailSignatureView,
  setEmailSignatureDefaultLocally,
} = emailSignatureSlice.actions;

/* =========================================================
   REDUCER
   ========================================================= */

export default emailSignatureSlice.reducer;
