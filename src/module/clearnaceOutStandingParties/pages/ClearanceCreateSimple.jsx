
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import {
    ArrowLeft,
    Wallet,
    UserRound,
    IndianRupee,
    CalendarDays,
    FileText,
    Save,
    ChevronDown,
    Loader2,
    RotateCcw,
    Search,
} from "lucide-react";

import toast from "react-hot-toast";

import {
    createClearance,
    fetchClearanceById,
    updateClearance,
    fetchAllClearance,
} from "../thunks/clearanceThunks";

import {
    fetchAllParties,
} from "../../parties/thunks/partyThunks";

import CustomSelect from "../../../common/custom/CustomSelect";

import LeaveConfirmationModal from "../../../common/confirmation/LeaveConfirmationModal";
import useLeaveConfirmation from "../../../common/confirmation/useLeaveConfirmation";

import { closeModal } from "../../../module/ui/uiSlice";

/* =========================================================
   INITIAL FORM DATA
========================================================= */

const initialFormData = {
    partyId: "",
    clearanceAmount: "",
    paymentMethod: "",
    paymentReferenceNumber: "",
    clearanceDate: new Date().toISOString().split("T")[0],
    remarks: "",
};

/* =========================================================
   PAYMENT METHOD OPTIONS
========================================================= */

const paymentMethodOptions = [
    { label: "Cash", value: "CASH" },
    { label: "UPI", value: "UPI" },
    { label: "Bank Transfer", value: "BANK_TRANSFER" },
    { label: "Card", value: "CARD" },
    { label: "Cheque", value: "CHEQUE" },
];

/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

const FormField = ({
    label,
    required = false,
    children,
    className = "",
}) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-sm font-medium text-gray-700">
            {label}
            {required && (
                <span className="ml-1 text-red-500">*</span>
            )}
        </label>

        {children}
    </div>
);

const TextInput = ({
    value,
    onChange,
    placeholder,
    type = "text",
    disabled = false,
    maxLength,
    min,
    step,
}) => (
    <input
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        step={step}
        className="
            h-10 w-full rounded-lg border border-gray-200
            bg-white px-3 text-sm text-gray-700
            outline-none transition
            placeholder:text-gray-400
            focus:border-[#408DFB] focus:ring-2
            focus:ring-[#408DFB]/10
            disabled:cursor-not-allowed disabled:bg-gray-100
        "
    />
);

const TextAreaField = ({
    value,
    onChange,
    placeholder,
    rows = 3,
}) => (
    <textarea
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="
            w-full resize-none rounded-lg border border-gray-200
            bg-white px-3 py-2.5 text-sm text-gray-700
            outline-none transition
            placeholder:text-gray-400
            focus:border-[#408DFB] focus:ring-2
            focus:ring-[#408DFB]/10
        "
    />
);

const SectionHeading = ({
    icon: Icon,
    title,
    description,
}) => (
    <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#408DFB]">
            <Icon size={19} />
        </div>

        <div>
            <h3 className="text-sm font-semibold text-gray-800">
                {title}
            </h3>

            {description && (
                <p className="mt-0.5 text-xs text-gray-400">
                    {description}
                </p>
            )}
        </div>
    </div>
);

/* =========================================================
   HELPERS
========================================================= */

const getResponseData = (response) => {
    if (!response) return null;

    return (
        response?.data?.data ??
        response?.data ??
        response?.result ??
        response
    );
};

const getPartyId = (party) =>
    party?.id ??
    party?.partyId ??
    null;

const getPartyName = (party) =>
    party?.companyName ??
    party?.partyName ??
    party?.name ??
    "Unnamed Party";

const getOutstandingCredit = (party) => {
    const amount = Number(
        party?.outstandingCredit ??
        party?.partyOutstandingCredit ??
        0
    );

    return Number.isFinite(amount) ? amount : 0;
};

const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(amount || 0));

/* =========================================================
   MAIN COMPONENT
========================================================= */

const ClearanceCreateNew = ({ onClose }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { id } = useParams();

    // ID exists = Edit mode
    const isEdit = Boolean(id);

    const modalData = useSelector(
        (state) => state.ui.modal?.data
    );

    const {
        loading = false,
        actionLoading = false,
    } = useSelector((state) => state.clearance ?? {});

    const parties = useSelector(
        (state) => state.party?.parties ?? []
    );

    const partyLoading = useSelector(
        (state) => state.party?.loading ?? false
    );

    const [formData, setFormData] = useState(initialFormData);

    const [saveMode, setSaveMode] = useState("close");
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const [partySearch, setPartySearch] = useState("");
    const [showPartyOptions, setShowPartyOptions] = useState(false);

    const {
        showLeaveConfirmation,
        confirmLeave,
        handleStay,
        handleLeave,
    } = useLeaveConfirmation();

    /* =====================================================
       SELECTED PARTY
    ===================================================== */

    const selectedParty = useMemo(() => {
        return parties.find(
            (party) =>
                String(getPartyId(party)) ===
                String(formData.partyId)
        ) || null;
    }, [parties, formData.partyId]);

    const currentOutstanding = selectedParty
        ? getOutstandingCredit(selectedParty)
        : 0;

    /*
     * In edit mode, the current outstanding may already reflect
     * the existing clearance. Add the existing amount back when
     * calculating the maximum editable amount.
     */
    const existingClearanceAmount = isEdit
        ? Number(formData.clearanceAmount || 0)
        : 0;

    const maximumClearanceAmount =
        currentOutstanding + existingClearanceAmount;

    const outstandingAfterClearance = Math.max(
        0,
        maximumClearanceAmount -
        Number(formData.clearanceAmount || 0)
    );

    /* =====================================================
       PARTY OPTIONS
    ===================================================== */

    const partyOptions = useMemo(() => {
        const keyword = partySearch.trim().toLowerCase();

        return parties
            .filter((party) => {
                const name = getPartyName(party).toLowerCase();

                const code = String(
                    party.partyCode || party.code || ""
                ).toLowerCase();

                const mobile = String(
                    party.mobile || party.phone || ""
                ).toLowerCase();

                return (
                    !keyword ||
                    name.includes(keyword) ||
                    code.includes(keyword) ||
                    mobile.includes(keyword)
                );
            })
            .map((party) => ({
                label: getPartyName(party),
                value: String(getPartyId(party)),
            }))
            .filter((option) => option.value && option.value !== "undefined");
    }, [parties, partySearch]);

    /* =====================================================
       FETCH PARTIES AND CLEARANCE FOR EDIT
    ===================================================== */

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                // Load parties for the selection dropdown.
                await dispatch(fetchAllParties()).unwrap();

                if (!isMounted) return;

                if (!isEdit) {
                    setFormData({
                        ...initialFormData,
                        clearanceDate: new Date()
                            .toISOString()
                            .split("T")[0],
                    });

                    return;
                }

                // Fetch existing clearance for edit.
                const response = await dispatch(
                    fetchClearanceById(id)
                ).unwrap();

                if (!isMounted) return;

                const clearance = getResponseData(response);

                if (!clearance) {
                    toast.error("Clearance not found");
                    return;
                }

                setFormData({
                    partyId: clearance.partyId ??
                        clearance.party?.id ??
                        "",
                    clearanceAmount:
                        clearance.clearanceAmount ?? "",
                    paymentMethod:
                        clearance.paymentMethod ?? "",
                    paymentReferenceNumber:
                        clearance.paymentReferenceNumber ?? "",
                    clearanceDate:
                        clearance.clearanceDate ??
                        new Date().toISOString().split("T")[0],
                    remarks: clearance.remarks ?? "",
                });
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to load clearance details"
                    );
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [dispatch, id, isEdit]);

    /* =====================================================
       HANDLE FIELD CHANGE
    ===================================================== */

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    /* =====================================================
       HANDLE PARTY CHANGE
    ===================================================== */

    const handlePartyChange = (value) => {
        handleChange("partyId", value);
        setPartySearch("");
        setShowPartyOptions(false);
    };

    /* =====================================================
       CLOSE FORM
    ===================================================== */

    const handleClose = () => {
        confirmLeave(() => {
            if (onClose) {
                onClose();
            } else {
                navigate("/inventory/parties/clearances");

                if (isEdit) {
                    navigate("/inventory/parties/clearances");
                }
            }
        });
    };

    /* =====================================================
       VALIDATION
    ===================================================== */

    const validateForm = () => {
        if (!formData.partyId) {
            toast.error("Please select a party");
            return false;
        }

        const amount = Number(formData.clearanceAmount);

        if (
            formData.clearanceAmount === "" ||
            formData.clearanceAmount === null ||
            formData.clearanceAmount === undefined
        ) {
            toast.error("Clearance amount is required");
            return false;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            toast.error("Enter a valid clearance amount");
            return false;
        }

        if (amount > maximumClearanceAmount) {
            toast.error(
                `Clearance amount cannot exceed ${formatCurrency(maximumClearanceAmount)}`
            );
            return false;
        }

        if (!formData.paymentMethod) {
            toast.error("Please select payment method");
            return false;
        }

        if (!formData.clearanceDate) {
            toast.error("Clearance date is required");
            return false;
        }

        return true;
    };

    /* =====================================================
       RESET FORM
    ===================================================== */

    const handleReset = () => {
        if (isEdit) {
            dispatch(fetchClearanceById(id))
                .unwrap()
                .then((response) => {
                    const clearance = getResponseData(response);

                    if (!clearance) {
                        toast.error("Clearance not found");
                        return;
                    }

                    setFormData({
                        partyId: clearance.partyId ??
                            clearance.party?.id ??
                            "",
                        clearanceAmount:
                            clearance.clearanceAmount ?? "",
                        paymentMethod:
                            clearance.paymentMethod ?? "",
                        paymentReferenceNumber:
                            clearance.paymentReferenceNumber ?? "",
                        clearanceDate:
                            clearance.clearanceDate ??
                            new Date().toISOString().split("T")[0],
                        remarks: clearance.remarks ?? "",
                    });

                    setPartySearch("");
                    setShowPartyOptions(false);

                    toast.success("Clearance details restored");
                })
                .catch((error) => {
                    toast.error(
                        typeof error === "string"
                            ? error
                            : "Failed to reset clearance form"
                    );
                });

            return;
        }

        setFormData({
            ...initialFormData,
            clearanceDate: new Date()
                .toISOString()
                .split("T")[0],
        });

        setPartySearch("");
        setShowPartyOptions(false);
    };

    /* =====================================================
       SAVE CLEARANCE
    ===================================================== */

    const handleSubmit = async (e, requestedSaveMode = null) => {
        e?.preventDefault();

        if (actionLoading || loading) return;

        if (!validateForm()) return;

        const currentSaveMode =
            requestedSaveMode || saveMode;

        const payload = {
            partyId: Number(formData.partyId),
            clearanceAmount: Number(formData.clearanceAmount),
            paymentMethod: formData.paymentMethod,
            paymentReferenceNumber:
                formData.paymentReferenceNumber.trim(),
            clearanceDate: formData.clearanceDate,
            remarks: formData.remarks.trim(),
        };

        try {
            let response;

            if (isEdit) {
                // UPDATE EXISTING CLEARANCE
                response = await dispatch(
                    updateClearance({
                        id,
                        data: payload,
                    })
                ).unwrap();

                toast.success(
                    response?.message ||
                    "Credit clearance updated successfully"
                );

                await dispatch(fetchAllClearance());

                navigate(-1);
                return;
            }

            // CREATE NEW CLEARANCE
            response = await dispatch(
                createClearance(payload)
            ).unwrap();

            toast.success(
                response?.message ||
                "Credit clearance created successfully"
            );

            // Refresh clearance records and party outstanding values.
            await Promise.all([
                dispatch(fetchAllClearance()),
                dispatch(fetchAllParties()),
            ]);

            if (currentSaveMode === "new") {
                setFormData({
                    ...initialFormData,
                    clearanceDate: new Date()
                        .toISOString()
                        .split("T")[0],
                });

                setPartySearch("");
                setShowPartyOptions(false);
                setSaveMode("close");

                return;
            }

            dispatch(closeModal());
        } catch (error) {
            console.error(
                isEdit
                    ? "Clearance update error:"
                    : "Clearance creation error:",
                error
            );

            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message ||
                    (isEdit
                        ? "Failed to update clearance"
                        : "Failed to create clearance")
            );
        }
    };

    /* =====================================================
       ESCAPE KEY
    ===================================================== */

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setShowSaveOptions(false);
                setShowPartyOptions(false);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    /* =====================================================
       RENDER LOADING
    ===================================================== */

    if (isEdit && loading) {
        return (
            <div className="flex h-full items-center justify-center bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2
                        size={20}
                        className="animate-spin"
                    />
                    Loading clearance details...
                </div>
            </div>
        );
    }

    /* =====================================================
       RENDER
    ===================================================== */

    return (
        <div className="flex h-full min-h-0 flex-col bg-gray-50 px-3.5 py-3">

            {/* HEADER */}

            <div className="mb-3 flex shrink-0 items-center justify-between rounded-xl border-b-[3px] border-[#B7E34A] bg-white px-5 py-4 shadow-sm">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={handleClose}
                        className="
                            flex h-9 w-9 items-center justify-center
                            rounded-lg border border-gray-200
                            text-gray-500 transition hover:bg-gray-100
                        "
                        title="Go Back"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h2 className="text-base font-semibold text-gray-800">
                            {isEdit
                                ? "Edit Credit Clearance"
                                : "Create Credit Clearance"}
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-400">
                            {isEdit
                                ? "Update your credit clearance information"
                                : "Record a payment against party outstanding credit"}
                        </p>
                    </div>

                </div>

                <div className="hidden items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 sm:flex">
                    <Wallet
                        size={16}
                        className="text-[#408DFB]"
                    />

                    <span className="text-xs font-medium text-[#408DFB]">
                        Credit Clearance
                    </span>
                </div>

            </div>

            {/* FORM */}

            <form
                onSubmit={(e) => handleSubmit(e, "close")}
                className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm"
            >

                <div className="flex-1 overflow-y-auto p-5">

                    {/* PARTY INFORMATION */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={UserRound}
                            title="Party Information"
                            description="Select the party whose outstanding credit is being cleared"
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            <FormField
                                label="Select Party"
                                required
                            >
                                <div className="relative">
                                    <CustomSelect
                                        value={
                                            formData.partyId
                                                ? String(formData.partyId)
                                                : ""
                                        }
                                        onChange={handlePartyChange}
                                        options={partyOptions}
                                        placeholder={
                                            partyLoading
                                                ? "Loading parties..."
                                                : "Select party"
                                        }
                                    />
                                </div>
                            </FormField>

                            <FormField label="Party Type">
                                <TextInput
                                    value={
                                        selectedParty?.partyType || ""
                                    }
                                    disabled
                                    placeholder="Party type"
                                />
                            </FormField>

                        </div>

                        {/* OUTSTANDING CREDIT */}

                        {selectedParty && (
                            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                                <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                                    <p className="text-xs font-medium text-amber-700">
                                        Current Outstanding Credit
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold text-amber-800">
                                        {formatCurrency(currentOutstanding)}
                                    </h3>
                                </div>

                                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                                    <p className="text-xs font-medium text-emerald-700">
                                        Outstanding After Clearance
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold text-emerald-800">
                                        {formatCurrency(outstandingAfterClearance)}
                                    </h3>
                                </div>

                            </div>
                        )}

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* CLEARANCE DETAILS */}

                    <section className="mb-7">

                        <SectionHeading
                            icon={IndianRupee}
                            title="Clearance Details"
                            description="Enter the clearance amount and payment information"
                        />

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

                            <FormField
                                label="Clearance Amount"
                                required
                            >
                                <div className="relative">
                                    <span className="
                                        absolute left-3 top-1/2
                                        -translate-y-1/2 text-sm
                                        font-medium text-gray-500
                                    ">
                                        ₹
                                    </span>

                                    <input
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={formData.clearanceAmount}
                                        onChange={(e) =>
                                            handleChange(
                                                "clearanceAmount",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter amount"
                                        className="
                                            h-10 w-full rounded-lg
                                            border border-gray-200
                                            bg-white pl-8 pr-3 text-sm
                                            text-gray-700 outline-none
                                            transition placeholder:text-gray-400
                                            focus:border-[#408DFB]
                                            focus:ring-2
                                            focus:ring-[#408DFB]/10
                                        "
                                    />
                                </div>

                                {selectedParty && (
                                    <p className="mt-1 text-[11px] text-gray-400">
                                        Maximum amount:{" "}
                                        {formatCurrency(maximumClearanceAmount)}
                                    </p>
                                )}
                            </FormField>

                            <FormField
                                label="Payment Method"
                                required
                            >
                                <CustomSelect
                                    value={formData.paymentMethod}
                                    onChange={(value) =>
                                        handleChange(
                                            "paymentMethod",
                                            value
                                        )
                                    }
                                    options={paymentMethodOptions}
                                    placeholder="Select payment method"
                                />
                            </FormField>

                            <FormField label="Clearance Date" required>
                                <div className="relative">
                                    <CalendarDays
                                        size={16}
                                        className="
                                            absolute left-3 top-1/2
                                            -translate-y-1/2
                                            text-gray-400
                                        "
                                    />

                                    <input
                                        type="date"
                                        value={formData.clearanceDate}
                                        onChange={(e) =>
                                            handleChange(
                                                "clearanceDate",
                                                e.target.value
                                            )
                                        }
                                        className="
                                            h-10 w-full rounded-lg
                                            border border-gray-200
                                            bg-white pl-9 pr-3 text-sm
                                            text-gray-700 outline-none
                                            transition focus:border-[#408DFB]
                                            focus:ring-2
                                            focus:ring-[#408DFB]/10
                                        "
                                    />
                                </div>
                            </FormField>

                            <FormField
                                label="Payment Reference Number"
                                className="md:col-span-2 lg:col-span-3"
                            >
                                <TextInput
                                    value={formData.paymentReferenceNumber}
                                    onChange={(e) =>
                                        handleChange(
                                            "paymentReferenceNumber",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter transaction ID / cheque number"
                                    maxLength={100}
                                />
                            </FormField>

                        </div>

                    </section>

                    <div className="my-6 border-t border-gray-100" />

                    {/* REMARKS */}

                    <section>

                        <SectionHeading
                            icon={FileText}
                            title="Additional Information"
                            description="Add any notes related to this clearance"
                        />

                        <div className="grid grid-cols-1 gap-5">

                            <FormField label="Remarks">
                                <TextAreaField
                                    value={formData.remarks}
                                    onChange={(e) =>
                                        handleChange(
                                            "remarks",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter clearance remarks..."
                                    rows={3}
                                />
                            </FormField>

                        </div>

                    </section>

                </div>

                {/* FOOTER */}

                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3">

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={actionLoading}
                        className="
                            rounded-lg border border-gray-200
                            px-4 py-2 text-sm font-medium
                            text-gray-600 transition hover:bg-gray-50
                            disabled:opacity-50
                        "
                    >
                        Cancel
                    </button>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={actionLoading || loading}
                            className="
                                flex items-center gap-2 rounded-lg
                                border border-gray-200 px-4 py-2
                                text-sm font-medium text-gray-600
                                transition hover:bg-gray-50
                                disabled:opacity-50
                            "
                        >
                            <RotateCcw size={15} />
                            Reset
                        </button>

                        <button
                            type="submit"
                            disabled={actionLoading || loading}
                            onClick={() => setSaveMode("close")}
                            className="
                                flex items-center gap-2 rounded-lg
                                bg-[#408DFB] px-5 py-2 text-sm
                                font-medium text-white transition
                                hover:bg-blue-600 disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {actionLoading && saveMode === "close" ? (
                                <Loader2
                                    size={16}
                                    className="animate-spin"
                                />
                            ) : (
                                <Save size={16} />
                            )}

                            {actionLoading
                                ? "Saving..."
                                : isEdit
                                    ? "Update"
                                    : "Save"}
                        </button>

                        {!isEdit && (
                            <div className="relative">

                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() =>
                                        setShowSaveOptions((prev) => !prev)
                                    }
                                    className="
                                        flex h-9 items-center justify-center
                                        rounded-lg border border-gray-200
                                        px-2 text-gray-600 transition
                                        hover:bg-gray-50 disabled:opacity-50
                                    "
                                >
                                    <ChevronDown size={17} />
                                </button>

                                {showSaveOptions && (
                                    <div className="
                                        absolute bottom-11 right-0 z-20
                                        w-44 overflow-hidden rounded-lg
                                        border border-gray-100 bg-white
                                        py-1 shadow-lg
                                    ">

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSaveMode("new");
                                                setShowSaveOptions(false);
                                                handleSubmit(null, "new");
                                            }}
                                            className="
                                                w-full px-4 py-2.5
                                                text-left text-sm text-gray-600
                                                transition hover:bg-blue-50
                                                hover:text-[#408DFB]
                                            "
                                        >
                                            Save & New
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSaveMode("close");
                                                setShowSaveOptions(false);
                                                handleSubmit(null, "close");
                                            }}
                                            className="
                                                w-full px-4 py-2.5
                                                text-left text-sm text-gray-600
                                                transition hover:bg-blue-50
                                                hover:text-[#408DFB]
                                            "
                                        >
                                            Save & Close
                                        </button>

                                    </div>
                                )}

                            </div>
                        )}

                    </div>

                </div>

            </form>

            {/* LEAVE CONFIRMATION */}

            <LeaveConfirmationModal
                show={showLeaveConfirmation}
                title="Leave Credit Clearance?"
                message="Are you sure you want to leave this credit clearance page?"
                stayText="Stay Here"
                leaveText="Leave"
                onStay={handleStay}
                onLeave={handleLeave}
            />

        </div>
    );
};

export default ClearanceCreateNew;
