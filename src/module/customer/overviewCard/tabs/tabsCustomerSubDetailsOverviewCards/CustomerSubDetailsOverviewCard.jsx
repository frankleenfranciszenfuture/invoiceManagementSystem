import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";

import {
  ChevronDown,
  Plus,
  Settings,
} from "lucide-react";

import {
  setActiveTab,
  setOpenCustomerType,
  setOpenCustomerLanguage,
  addRecentActivity,
} from "../../../slices/customerSlices";

import { openModal } from "../../../../ui/uiSlice";

import { saveCustomer } from "../../../thunks/customerThunks";

import EditableFieldCustomer from "../../editable/EditableFieldCustomer";
import ActivityTimeline from "../../activity/ActivityTimeline";

export default function CustomerSubDetailsOverviewCard() {
  const dispatch = useDispatch();

  // ============================================================
  // CUSTOMER STATE
  // ============================================================

  const {
    selectedCustomer,
    customerTypes,
    customerTypeSearch,
    openCustomerType,
    customerLanguageSearch,
    openCustomerLanguage,
  } = useSelector((state) => state.customers);

  const customer = selectedCustomer;

  // ============================================================
  // REFS
  // ============================================================

  const customerDropdownRef = useRef(null);

  // ============================================================
  // LOCAL STATE
  // ============================================================

  const [showSummary, setShowSummary] = useState(false);
  const [showOtherDetails, setShowOtherDetails] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  // ============================================================
  // IMAGE
  // ============================================================

  const [image, setImage] = useState(
    localStorage.getItem("logoImage") || null,
  );

  useEffect(() => {
    const savedLogo = localStorage.getItem("companyLogo");

    if (savedLogo) {
      setImage(savedLogo);
    }
  }, []);

  // ============================================================
  // CLOSE DROPDOWN
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target)
      ) {
        dispatch(setOpenCustomerType(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, [dispatch]);

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setImage(reader.result);
      localStorage.setItem("companyLogo", reader.result);
    };

    reader.readAsDataURL(file);
  };

  const openFilePicker = () => {
    document.getElementById("logo-upload")?.click();
  };

  // ============================================================
  // ADDRESS
  // ============================================================

  const address = [
    customer?.billingAddress?.attention,
    customer?.billingAddress?.address,
    customer?.billingAddress?.city,
    customer?.billingAddress?.state,
    customer?.billingAddress?.country,
    customer?.billingAddress?.zipCode,
  ]
    .filter(Boolean)
    .join("\n");

  const shippingAddress = [
    customer?.shippingAddress?.attention,
    customer?.shippingAddress?.address,
    customer?.shippingAddress?.city,
    customer?.shippingAddress?.state,
    customer?.shippingAddress?.country,
    customer?.shippingAddress?.zipCode,
  ]
    .filter(Boolean)
    .join("\n");

  // ============================================================
  // CUSTOMER LANGUAGES
  // ============================================================

  const customerLanguages = [
    "English",
    "Tamil",
    "Hindi",
    "Malayalam",
  ];

  // ============================================================
  // PAYMENT TERMS
  // ============================================================

  const paymentTerms = [
    "Due on Receipt",
    "Net 15",
    "Net 30",
    "Net 45",
    "Net 60",
    "Net 90",
  ];

  // ============================================================
  // FILTER CUSTOMER TYPES
  // ============================================================

  const filteredCustomerTypes = (customerTypes || []).filter(
    (type) =>
      type
        ?.toLowerCase()
        .includes(
          (customerTypeSearch || "").toLowerCase(),
        ),
  );

  // ============================================================
  // FILTER CUSTOMER LANGUAGES
  // ============================================================

  const filteredCustomerLanguages =
    customerLanguages.filter((lang) =>
      lang
        .toLowerCase()
        .includes(
          (customerLanguageSearch || "").toLowerCase(),
        ),
    );

  // ============================================================
  // CUSTOMER DETAILS
  // ============================================================

  const customerDetails = [
    {
      label: "Customer Type",
      value: customer?.customerType || "-",
      key: "customerType",
      type: "select",
      options: filteredCustomerTypes,
      open: openCustomerType,
      setOpen: setOpenCustomerType,
    },

    {
      label: "Default Currency",
      value: customer?.currency || "-",
      key: "currency",
      type: "text",
    },

    {
      label: "PAN",
      value: customer?.pan || "-",
      key: "pan",
      type: "text",
    },

    {
      label: "Customer Language",
      value: customer?.customerLanguage || "-",
      key: "customerLanguage",
      type: "select",
      options: filteredCustomerLanguages,
      open: openCustomerLanguage,
      setOpen: setOpenCustomerLanguage,
    },

    {
      label: "Payment Terms",
      value: customer?.paymentTerms || "-",
      key: "paymentTerms",
      type: "select",
      options: paymentTerms,
    },
  ];

  // ============================================================
  // HANDLE CUSTOMER SAVE
  // ============================================================

  const handleSave = async () => {
    try {
      const updatedCustomer = await dispatch(
        saveCustomer(),
      ).unwrap();

      toast.success("Customer updated successfully");

      dispatch(
        addRecentActivity({
          title: "Customer Updated",
          description: `${updatedCustomer.displayName} details updated successfully`,
          user: updatedCustomer.displayName,
          date: new Date().toLocaleDateString("en-GB"),
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }),
      );

      dispatch(setOpenCustomerType(false));
      dispatch(setOpenCustomerLanguage(false));
    } catch (err) {
      console.error("Customer update error:", err);

      toast.error(
        err?.message ||
        String(err) ||
        "Something went wrong",
      );
    }
  };

  // ============================================================
  // NO CUSTOMER
  // ============================================================

  if (!customer) {
    return (
      <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        w-full
        min-w-0
        bg-white
        border-r
        border-gray-200
        rounded-md
        mt-5
        overflow-y-auto
      "
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-3.5
          border-b
          border-gray-100
        "
      >
        <h2
          className="
            text-base
            font-medium
            text-gray-800
            underline
            decoration-dotted
            decoration-gray-300
            underline-offset-4
          "
        >
          Customer Overview
        </h2>

        <button
          type="button"
          className="
            flex
            items-center
            gap-1
            text-sm
            text-blue-600
            hover:text-blue-700
            font-medium
          "
        >
          <Plus
            className="
              w-4
              h-4
              rounded-full
              bg-blue-600
              text-white
              p-0.5
            "
          />

          New
        </button>
      </div>

      {/* ======================================================
          CUSTOMER HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-3
          px-5
          py-5
          border-b
          border-gray-100
        "
      >
        {/* Logo */}

        <div className="shrink-0">
          <div
            onClick={openFilePicker}
            className="
              w-13
              h-13
              rounded-xl
              bg-gradient-to-br
              from-cyan-400
              to-indigo-500
              flex
              items-center
              justify-center
              overflow-hidden
              cursor-pointer
            "
          >
            {image ? (
              <img
                src={image}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 text-white"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
            )}
          </div>

          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Customer Info */}

        <div className="min-w-0 flex-1">
          <p className="text-xl text-gray-900 truncate">
            {customer.displayName}
          </p>

          <p className="text-sm text-gray-500 truncate">
            {customer.email || "-"}
          </p>

          <p className="text-sm text-gray-500">
            {customer.mobile || "-"}
          </p>
        </div>

        {/* Settings */}

        <button
          type="button"
          className="
            shrink-0
            flex
            items-center
            justify-center
          "
        >
          <Settings
            className="
              w-5
              h-5
              rounded-lg
              bg-blue-600
              text-white
              p-0.5
              cursor-pointer
            "
          />
        </button>
      </div>

      {/* ======================================================
          ADDRESS + OTHER DETAILS
          TWO COLUMN LAYOUT
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          border-b
          border-gray-200
        "
      >
        {/* ====================================================
            LEFT - ADDRESS
        ==================================================== */}

        <div
          className="
            min-w-0
            border-b
            lg:border-b-0
            lg:border-r
            border-gray-200
          "
        >
          {/* Section Header */}

          <div className="px-5">
            <button
              type="button"
              onClick={() =>
                setShowSummary(!showSummary)
              }
              className="
                flex
                items-center
                gap-1
                w-full
                py-3
                text-sm
                text-gray-600
                uppercase
                font-semibold
                border-b
                border-gray-200
                cursor-pointer
              "
            >
              Address

              <ChevronDown
                size={14}
                className={`transition-transform ${showSummary
                  ? "rotate-180"
                  : ""
                  }`}
              />
            </button>
          </div>

          {/* Address Content */}

          {!showSummary && (
            <div
              className="
      grid
      grid-cols-1
      md:grid-cols-2
      divide-y
      md:divide-y-0
      md:divide-x
      divide-gray-200
    "
            >
              {/* BILLING ADDRESS - LEFT */}
              <div className="px-5 py-5 min-w-0 ">
                <p className="text-sm font-semibold text-gray-800">
                  Billing Address
                </p>

                {address ? (
                  <div
                    className="
            mt-3
            rounded-lg
            border
            border-gray-200
            bg-gray-50
            p-4
            text-xl
            text-gray-600
            min-h-[261px]
          "
                  >
                    {customer.billingAddress?.attention && (
                      <div className="font-bold text-gray-800 mb-1">
                        {customer.billingAddress.attention},
                      </div>
                    )}

                    {[
                      customer.billingAddress?.address,
                      customer.billingAddress?.city,
                      customer.billingAddress?.state,
                      customer.billingAddress?.country,
                      customer.billingAddress?.zipCode,
                    ]
                      .filter(Boolean)
                      .map((line, index, arr) => (
                        <div key={index}>
                          {line}
                          {index < arr.length - 1 && ","}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div
                    className="
            mt-3
            rounded-lg
            border-2
            border-dashed
            border-gray-300
            bg-gray-50
            p-5
            text-center
            min-h-[250px]
            flex
            flex-col
            items-center
            justify-center
          "
                  >
                    <p className="text-sm text-gray-500">
                      No billing address found.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        dispatch(setActiveTab("Address"));
                        dispatch(
                          openModal({
                            type: "editCustomer",
                          })
                        );
                      }}
                      className="
              mt-3
              rounded-md
              bg-blue-600
              px-4
              py-2
              text-white
            "
                    >
                      + Add Address
                    </button>
                  </div>
                )}
              </div>

              {/* SHIPPING ADDRESS - RIGHT */}
              <div className="px-5 py-5 min-w-0">
                <p className="text-sm font-semibold text-gray-800">
                  Shipping Address
                </p>

                {shippingAddress ? (
                  <div
                    className="
            mt-3
            rounded-lg
            border
            border-gray-200
            bg-gray-50
            p-4
            text-xl
            text-gray-600
            min-h-[260px]
          "
                  >
                    {customer.shippingAddress?.attention && (
                      <div className="font-bold text-gray-800 mb-1">
                        {customer.shippingAddress.attention},
                      </div>
                    )}

                    {[
                      customer.shippingAddress?.address,
                      customer.shippingAddress?.city,
                      customer.shippingAddress?.state,
                      customer.shippingAddress?.country,
                      customer.shippingAddress?.zipCode,
                    ]
                      .filter(Boolean)
                      .map((line, index, arr) => (
                        <div key={index}>
                          {line}
                          {index < arr.length - 1 && ","}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div
                    className="
            mt-3
            rounded-lg
            border-2
            border-dashed
            border-gray-300
            bg-gray-50
            p-5
            text-center
            min-h-[150px]
            flex
            flex-col
            items-center
            justify-center
          "
                  >
                    <p className="text-sm text-gray-500">
                      No shipping address found.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        dispatch(setActiveTab("Address"));
                        dispatch(
                          openModal({
                            type: "editCustomer",
                          })
                        );
                      }}
                      className="
              mt-3
              rounded-md
              bg-blue-600
              px-4
              py-2
              text-white
            "
                    >
                      + Add Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ====================================================
            RIGHT - OTHER DETAILS
        ==================================================== */}

        <div className="min-w-0">
          {/* Section Header */}

          <div className="px-5">
            <button
              type="button"
              onClick={() =>
                setShowOtherDetails(
                  !showOtherDetails,
                )
              }
              className="
                flex
                items-center
                gap-1
                w-[280px]
                py-3
                text-sm
                text-gray-600
                uppercase
                font-semibold
                border-b
                border-gray-200
                cursor-pointer
              "
            >
              Other Details

              <ChevronDown
                size={14}
                className={`transition-transform ${showOtherDetails
                  ? "rotate-180"
                  : ""
                  }`}
              />
            </button>
          </div>

          {/* Details */}

          {!showOtherDetails && (
            <div className="px-5 py-4">
              <div
                className="
                mt-9
                  rounded-lg
                  border
                  border-gray-200
                  bg-gray-50
                  px-3
                  py-2
                "
              >
                <div className="space-y-2.5">
                  {customerDetails.map(
                    (item) => (
                      <EditableFieldCustomer
                        key={item.label}
                        item={item}
                        customer={customer}
                      />
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div >

      {/* ======================================================
          CONTACT PERSONS
      ====================================================== */}

      < div className="border-b border-gray-200" >
        <div className="px-5">
          <button
            type="button"
            onClick={() =>
              setShowContactDetails(
                !showContactDetails,
              )
            }
            className="
              flex
              items-center
              gap-1
              w-full
              py-3
              text-sm
              text-gray-600
              uppercase
              font-semibold
              border-b
              border-gray-200
              cursor-pointer
            "
          >
            Contact Persons

            <ChevronDown
              size={14}
              className={`transition-transform ${showContactDetails
                ? "rotate-180"
                : ""
                }`}
            />
          </button>
        </div>

        {
          showContactDetails && (
            <div className="px-5 py-4">
              {customer.contactPersons?.length > 0 ? (
                <div
                  className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-4
                "
                >
                  {customer.contactPersons.map(
                    (contact, index) => (
                      <div
                        key={index}
                        className="
                        rounded-lg
                        border
                        border-gray-200
                        bg-gray-50
                        p-4
                      "
                      >
                        <div
                          className="
                          grid
                          grid-cols-1
                          md:grid-cols-2
                          gap-y-3
                          gap-x-6
                          text-sm
                        "
                        >
                          <div>
                            <span className="font-medium text-gray-700">
                              Name:
                            </span>{" "}
                            {`${contact.salutation ?? ""} ${contact.firstName ?? ""
                              } ${contact.lastName ?? ""
                              }`.trim() || "-"}
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              Email:
                            </span>{" "}
                            {contact.email || "-"}
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              Mobile:
                            </span>{" "}
                            {contact.mobile || "-"}
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              Work Phone:
                            </span>{" "}
                            {contact.workPhone || "-"}
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              Designation:
                            </span>{" "}
                            {contact.designation || "-"}
                          </div>

                          <div>
                            <span className="font-medium text-gray-700">
                              Department:
                            </span>{" "}
                            {contact.department || "-"}
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div
                  className="
                  rounded-lg
                  border-2
                  border-dashed
                  border-gray-300
                  bg-gray-50
                  p-5
                  text-center
                "
                >
                  <p className="text-sm text-gray-500">
                    No contact persons found.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      dispatch(
                        openModal({
                          type: "addContactPerson",
                        }),
                      );
                    }}
                    className="
                    mt-3
                    rounded-md
                    bg-blue-600
                    px-4
                    py-2
                    text-white
                  "
                  >
                    + Add Contact
                  </button>
                </div>
              )}
            </div>
          )
        }
      </div >

      {/* ======================================================
          ACTIVITY TIMELINE
      ====================================================== */}

      < div >
        <div className="px-5">
          <button
            type="button"
            onClick={() =>
              setShowActivityDetails(
                !showActivityDetails,
              )
            }
            className="
              flex
              items-center
              gap-1
              w-full
              py-3
              text-sm
              text-gray-600
              uppercase
              font-semibold
              border-b
              border-gray-200
              cursor-pointer
            "
          >
            Activity Timeline

            <ChevronDown
              size={14}
              className={`transition-transform ${showActivityDetails
                ? "rotate-180"
                : ""
                }`}
            />
          </button>
        </div>

        {
          showActivityDetails && (
            <div className="px-5 py-4">
              <ActivityTimeline />
            </div>
          )
        }
      </div >
    </div >
  );
}