import React from "react";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { assets } from "../../../../../assets/assets";

import {
  Check,
  ChevronDown,
  Edit,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Settings,
  X,
} from "lucide-react";

import {
  setField,
  setActiveTab,
  setOpenCustomerType,
  setCustomerTypeSearch,
  updateSelectedCustomerField,
  setIsEditingCustomerType,
  setEditingField,
  setEditCustomerType,
  saveCustomerType,
  cancelCustomerType,
  setCustomerLanguageSearch,
  setOpenCustomerLanguage,
  addRecentActivity,
} from "../../../slices/customerSlices";

import { openModal } from "../../../../ui/uiSlice";

import { saveCustomer } from "../../../thunks/customerThunks";

import EditableFieldCustomer from "../../editable/EditableFieldCustomer";
import AddContactPerson from "../../model/AddContactPerson";
import ActivityTimeline from "../../activity/ActivityTimeline";

export default function CustomerSubDetailsOverviewCard() {
  const dispatch = useDispatch();

  const customer = useSelector((state) => state.customers.selectedCustomer);

  const customers = useSelector((state) => state.customers.customers);

  const { selectedCustomer } = useSelector((state) => state.customers);

  const customerDropdownRef = useRef(null);
  const saveMenuRef = useRef(null);

  const {
    customerType,
    customerTypes,
    customerTypeSearch,
    openCustomerType,
    isEditingCustomerType,
    editCustomerType,
    customerLanguageSearch,
    openCustomerLanguage,
    contactPersons,
  } = useSelector((state) => state.customers);

  const [showSummary, setShowSummary] = useState(false);
  const [showOtherDeatils, setShowOtherDeatils] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showActivityDetails, setShowActivityDetails] = useState(false);

  // const { receivables, loading, error } = useSelector(
  //     (state) => state.dashboard,
  // );

  //image upload
  //.............
  const [selectedFile, setSelectedFile] = useState(null);
  const [image, setImage] = useState(localStorage.getItem("logoImage") || null);

  useEffect(() => {
    const savedLogo = localStorage.getItem("companyLogo");
    if (savedLogo) {
      setImage(savedLogo);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target)
      ) {
        dispatch(setOpenCustomerType(false));
      }

      if (saveMenuRef.current && !saveMenuRef.current.contains(e.target)) {
        dispatch(setShowSaveMenu(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dispatch]);

  const handleSave = async () => {
    try {
      console.log("Saving...");

      const updatedCustomer = await dispatch(saveCustomer()).unwrap();

      console.log("Before success toast");
      toast.success("Customer updated successfully");
      console.log("After success toast");

      console.log("Saved:", updatedCustomer);

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

      console.log("Activity Added");

      dispatch(setEditingField(null));
      dispatch(setOpenCustomerType(false));
    } catch (err) {
      console.error(err);
      toast.error(err?.message || String(err) || "Something went wrong");
    }
  };

  const handleCancel = () => {
    dispatch(setEditingField(null));
    dispatch(setOpenCustomerType(false));
    dispatch(setOpenCustomerLanguage(false));
  };

  const handleChange = (field) => (e) => {
    dispatch(setField({ field, value: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        setImage(reader.result);
        localStorage.setItem("companyLogo", reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const openFilePicker = () => {
    document.getElementById("logo-upload").click();
  };
  //........

  const formatAmount = (amount) =>
    `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const fmt = (v) => {
    if (v == null) return "₹0";
    return (
      "₹" +
      Number(v).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  };

  function Skeleton({ className = "h-6 w-24" }) {
    return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
  }

  // const billing = customer.billingAddress;

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

  const customerDetails = [
    {
      label: "Customer Type",
      value: selectedCustomer?.customerType,
    },

    {
      label: "Default Currency",
      value: selectedCustomer?.currency,
    },

    {
      label: "Pan",
      value: selectedCustomer?.pan,
    },
    {
      label: "Customer Language",
      value: selectedCustomer?.customerLanguage,
    },
  ];

  const contactDetails = [
    {
      label: "Name",
      value:
        `${selectedCustomer?.contactPerson?.salutation ?? ""} ${selectedCustomer?.contactPerson?.firstName ?? ""} ${selectedCustomer?.contactPerson?.lastName ?? ""}`.trim(),
    },
    {
      label: "Email",
      value: selectedCustomer?.contactPerson?.email,
    },
    {
      label: "Work Phone",
      value: selectedCustomer?.contactPerson?.workPhone,
    },
    {
      label: "Mobile",
      value: selectedCustomer?.contactPerson?.mobile,
    },
    {
      label: "Skype",
      value: selectedCustomer?.contactPerson?.skype,
    },
    {
      label: "Designation",
      value: selectedCustomer?.contactPerson?.designation,
    },
    {
      label: "Department",
      value: selectedCustomer?.contactPerson?.department,
    },
  ];

  const customerLanguages = ["English", "Tamil", "Hindi", "Malayalam"];

  // customerType

  const handleEdit = (field) => {
    console.log("Edit:", field);

    switch (field) {
      case "Customer Type":
        // Open customer type modal
        break;

      case "Default Currency":
        // Open currency modal
        break;

      case "PAN":
        // Open PAN modal
        break;

      case "Portal Status":
        // Open portal status modal
        break;

      case "Customer Language":
        // Open language modal
        break;

      default:
        break;
    }
  };

  const filteredCustomerTypes = customerTypes.filter((type) =>
    type.toLowerCase().includes(customerTypeSearch.toLowerCase()),
  );

  const filteredCustomerLanguages = customerLanguages.filter((lang) =>
    lang.toLowerCase().includes(customerLanguageSearch.toLowerCase()),
  );

  const editableFields = {
    "Customer Type": {
      key: "customerType",
      options: filteredCustomerTypes,
      open: openCustomerType,
      setOpen: setOpenCustomerType,
    },
    "Customer Language": {
      key: "customerLanguage",
      options: filteredCustomerLanguages,
      open: openCustomerLanguage,
      setOpen: setOpenCustomerLanguage,
    },
  };

  if (!customer) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[480px] h-screen bg-white border-r border-gray-200 overflow-y-auto rounded-md bg-white mt-5 w">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <h2 className="text-base font-medium text-gray-800 underline decoration-dotted decoration-gray-300 underline-offset-4">
          Customer Overview
        </h2>
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
          <Plus className="w-4 h-4 rounded-full bg-blue-600 text-white p-0.5" />
          New
        </button>
      </div>

      <div className="flex items-center gap-2 cursor-pointer">
        <div className="px-5 pt-5 pb-3">
          {/* Logo */}
          <div className="flex justify-left mb-2 ">
            <div
              onClick={openFilePicker}
              className="
          w-13 h-13
          rounded-xl
          bg-gradient-to-br
          from-cyan-400
          to-indigo-500
          flex items-center justify-center
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
        </div>

        <div className="w-full px-2 flex items-center">
          <div>
            <p className="text-xl">{customer.displayName}</p>
            <p className="text-sm text-gray-500">{customer.email}</p>
            <p className="text-sm text-gray-500">{customer.mobile}</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium mr-3 mb-6">
          <Settings className="w-5 h-5 rounded-lg bg-blue-600 text-white p-0.5 cursor-pointer" />
        </button>

        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full bg-gray-300 rounded-full"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Address show summary */}

      <div className="col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-left px-5 border-b border-gray-50">
          <button
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 uppercase w-full border-b border-gray-200 py-2 font-semibold justify-left cursor-pointer"
          >
            {/* {showSummary ? "Show" : "Show"} Address */}
            Address
            <ChevronDown
              size={14}
              className={`transition-transform ${showSummary ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        {!showSummary && (
          <div className="mt-2 text-sm text-gray-600 space-y-1 border-b border-gray-200 px-5 pt-2 py-3">
            <div className="flex font-medium">
              <div className="w-full">
                <p className="font-semibold text-gray-800">Billing Address</p>

                {address ? (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {/* <p className="text-gray-700">{address}</p> */}
                    <div>
                      {customer.billingAddress?.attention && (
                        <div className="text-lg font-bold mb-1">
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
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                    <p className="text-sm text-gray-500">
                      No billing address found.
                    </p>
                    <button
                      onClick={() => {
                        dispatch(setActiveTab("Address"));

                        dispatch(
                          openModal({
                            type: "editCustomer",
                          }),
                        );
                      }}
                      className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-white"
                    >
                      {address ? "Edit Address" : "+ Add Address"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex font-medium mt-4">
              <div className="w-full">
                <p className="font-semibold text-gray-800">Shipping Address</p>

                {shippingAddress ? (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    {/* <p className="text-gray-700">{shippingAddress}</p> */}

                    <div>
                      {customer.shippingAddress?.attention && (
                        <div className="text-lg font-bold mb-1">
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
                  </div>
                ) : (
                  <div className="mt-3 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                    <p className="text-sm text-gray-500">
                      No billing address found.
                    </p>
                    <button
                      onClick={() => {
                        dispatch(setActiveTab("Address"));

                        dispatch(
                          openModal({
                            type: "editCustomer",
                          }),
                        );
                      }}
                      className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-white"
                    >
                      {address ? "Edit Address" : "+ Add Address"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer other Details show summary */}
        <div className="flex items-center justify-left px-5  border border-gray-50 mb-2">
          <button
            onClick={() => setShowOtherDeatils(!showOtherDeatils)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 uppercase w-full border-b border-gray-200 font-semibold justify-left cursor-pointer py-2"
          >
            {/* {showSummary ? "Show" : "Show"} Address */}
            Other Details
            <ChevronDown
              size={14}
              className={`transition-transform ${showOtherDeatils ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {!showOtherDeatils && (
          <div className="mt-2 text-sm text-gray-600 space-y-1 border-b border-gray-200 px-5 pt-2 py-3 cursor-pointer">
            <div className="flex font-medium">
              <div className="w-full">
                {customerDetails && customerDetails.length > 0 ? (
                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 text-md px-2 py-2">
                    <div className="flex justify-between">
                      <div className="space-y-4 w-full ">
                        {customerDetails.map((item) => (
                          <EditableFieldCustomer
                            key={item.label}
                            item={item}
                            customer={customer}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                    <p className="text-sm text-gray-500">No details found.</p>

                    <button
                      onClick={() => {
                        dispatch(setActiveTab("Other Details"));
                        dispatch(
                          openModal({
                            type: "editCustomer",
                          }),
                        );
                      }}
                      className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-white "
                    >
                      + Add Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Details */}

        <div className="flex items-center justify-left px-5  border border-gray-50 mb-2">
          <button
            onClick={() => setShowContactDetails(!showContactDetails)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 uppercase w-full border-b border-gray-200 font-semibold justify-left cursor-pointer py-2"
          >
            {/* {showSummary ? "Show" : "Show"} Address */}
            Contact persons
            {/* <ChevronDown
              size={14}
              className={`transition-transform ${showContactDetails ? "rotate-180" : ""}`}
            /> */}
          </button>
        </div>

        {/* {showContactDetails && ( */}
        <div className="mt-2 border-b border-gray-200 px-5 py-3">
          {customer.contactPersons?.length > 0 ? (
            <div className="space-y-4">
              {customer.contactPersons.map((contact, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                >
                  <div className="grid grid-cols-2 gap-y-3">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span>{" "}
                      {`${contact.salutation ?? ""} ${contact.firstName ?? ""} ${contact.lastName ?? ""}`.trim()}
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Email:</span>{" "}
                      {contact.email || "-"}
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">Mobile:</span>{" "}
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
              ))}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-5 text-center">
              <p className="text-sm text-gray-500">No contact persons found.</p>
              <button
                onClick={() => {
                  dispatch(
                    openModal({
                      type: "addContactPerson",
                    }),
                  );
                }}
                className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-white"
              >
                + Add Contact
              </button>
            </div>
          )}
        </div>
        {/* )} */}
        {/*  */}

        {/* showActivityDetails */}

        <div className="flex items-center justify-left px-5  border border-gray-50 mb-2">
          <button
            onClick={() => showActivityDetails(!showActivityDetails)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 uppercase w-full border-b border-gray-200 font-semibold justify-left cursor-pointer py-2"
          >
            {/* {showSummary ? "Show" : "Show"} Address */}
            Activity timeLine
            {/* <ChevronDown
              size={14}
              className={`transition-transform ${showContactDetails ? "rotate-180" : ""}`}
            /> */}
          </button>
        </div>

        <div className="mt-2 border-b border-gray-200 px-5 py-3">
          <ActivityTimeline />

          {/* <button
            onClick={() =>
              dispatch(
                addRecentActivity({
                  title: "Test Activity",
                  description: "Redux Test",
                  user: "Frankleen",
                  date: "01/07/2026",
                  time: "06:00 PM",
                })
              )}
          >
            Test Activity
          </button> */}
        </div>

        {/*  */}
      </div>
    </div>
  );
}
