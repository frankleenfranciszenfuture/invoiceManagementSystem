import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../../../module/ui/uiSlice";
import toast from "react-hot-toast";
import {
    CalendarDays,
    PackageCheck,
    ClipboardList,
} from "lucide-react";

import {
    createPurchaseOrderGoodsReceipt,
} from "../thunks/purchaseOrderThunks";

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getPendingQuantity = (item) => {
    if (item.pendingQuantity !== undefined && item.pendingQuantity !== null) {
        return Number(item.pendingQuantity);
    }

    return Math.max(
        0,
        Number(item.quantity || 0) - Number(item.receivedQuantity || 0)
    );
};

export default function CreateGoodsReceiptModel() {
    const dispatch = useDispatch();

    // =========================================================
    // REDUX
    // =========================================================

    const { open, type, data } = useSelector(
        (state) => state.ui.modal
    );

    const isOpen = open && type === "createGoodsReceipt";

    // =========================================================
    // LOCAL STATE
    // =========================================================

    const [receiptDate, setReceiptDate] = useState(getToday());
    const [notes, setNotes] = useState("");
    const [items, setItems] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    // =========================================================
    // PURCHASE ORDER
    // =========================================================

    const purchaseOrder = data || {};

    const orderItems = useMemo(
        () => purchaseOrder?.items || [],
        [purchaseOrder]
    );

    const pendingItems = useMemo(
        () => orderItems.filter(
            (item) => getPendingQuantity(item) > 0
        ),
        [orderItems]
    );

    // =========================================================
    // INITIALIZE FORM
    // =========================================================

    useEffect(() => {
        if (!isOpen || !purchaseOrder?.id) {
            return;
        }

        setReceiptDate(getToday());
        setNotes("");

        setItems(
            pendingItems.map((item) => ({
                purchaseOrderItemId: item.id,
                productId: item.productId,
                productName: item.productName || "Product",
                description: item.description || "",
                unitName: item.unitName || "",
                orderedQuantity: Number(item.quantity || 0),
                receivedQuantity: Number(item.receivedQuantity || 0),
                pendingQuantity: getPendingQuantity(item),

                // Editable receipt cost
                receivedUnitCost: Number(
                    item.unitPrice ?? item.baseUnitPrice ?? 0
                ),

                // Start with zero received quantity.
                quantityToReceive: "",
            }))
        );

    }, [isOpen, purchaseOrder?.id, pendingItems]);

    // =========================================================
    // HANDLE ITEM CHANGE
    // =========================================================

    const handleItemChange = (index, field, value) => {
        setItems((previousItems) =>
            previousItems.map((item, itemIndex) =>
                itemIndex === index
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    // =========================================================
    // TOTALS
    // =========================================================

    const totalReceivingQuantity = items.reduce(
        (total, item) =>
            total + Number(item.quantityToReceive || 0),
        0
    );

    const totalReceivingAmount = items.reduce(
        (total, item) =>
            total +
            Number(item.quantityToReceive || 0) *
            Number(item.receivedUnitCost || 0),
        0
    );

    // =========================================================
    // SAVE GOODS RECEIPT
    // =========================================================

    const handleSave = async () => {
        if (!purchaseOrder?.id) {
            toast.error("Purchase order not found.");
            return;
        }

        if (!receiptDate) {
            toast.error("Please select a receipt date.");
            return;
        }

        const selectedItems = items.filter(
            (item) => Number(item.quantityToReceive) > 0
        );

        if (selectedItems.length === 0) {
            toast.error("Please enter at least one received quantity.");
            return;
        }

        for (const item of selectedItems) {
            const receivedQuantity = Number(item.quantityToReceive);
            const receivedUnitCost = Number(item.receivedUnitCost);

            if (
                receivedQuantity <= 0 ||
                receivedQuantity > item.pendingQuantity
            ) {
                toast.error(
                    `Received quantity cannot exceed pending quantity for ${item.productName}.`
                );
                return;
            }

            if (!Number.isFinite(receivedUnitCost) || receivedUnitCost < 0) {
                toast.error(
                    `Enter a valid unit cost for ${item.productName}.`
                );
                return;
            }
        }

        const payload = {
            purchaseOrderId: purchaseOrder.id,
            receiptDate,
            notes: notes.trim(),
            items: selectedItems.map((item) => ({
                purchaseOrderItemId: item.purchaseOrderItemId,
                receivedQuantity: Number(item.quantityToReceive),
                receivedUnitCost: Number(item.receivedUnitCost),
            })),
        };

        try {
            setSubmitting(true);

            await dispatch(
                createPurchaseOrderGoodsReceipt(payload)
            ).unwrap();

            toast.success("Goods received successfully.");

            dispatch(closeModal());

        } catch (error) {
            toast.error(
                typeof error === "string"
                    ? error
                    : error?.message || "Failed to create goods receipt."
            );
        } finally {
            setSubmitting(false);
        }
    };

    // =========================================================
    // CANCEL
    // =========================================================

    const handleCancel = () => {
        if (submitting) return;

        setItems([]);
        setNotes("");
        dispatch(closeModal());
    };

    if (!isOpen) {
        return null;
    }

    // =========================================================
    // NO PENDING ITEMS
    // =========================================================

    if (pendingItems.length === 0) {
        return (
            <div className="w-full max-w-[950px] rounded-xl bg-white shadow-2xl">

                <div className="flex items-center gap-3 border-b px-6 py-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                        <PackageCheck className="text-green-600" size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">
                            Create Goods Receipt
                        </h2>
                        <p className="text-xs text-gray-500">
                            {purchaseOrder.orderNo}
                        </p>
                    </div>
                </div>

                <div className="px-6 py-12 text-center">
                    <PackageCheck
                        size={42}
                        className="mx-auto mb-3 text-green-500"
                    />

                    <h3 className="font-semibold text-gray-800">
                        All items have been received
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        There are no pending quantities for this purchase order.
                    </p>
                </div>

                <div className="flex justify-end border-t px-6 py-4">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-lg border px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    // =========================================================
    // MAIN MODAL
    // =========================================================

    return (
        <div className="
            flex
            h-[90vh]
            max-h-[90vh]
            w-full
            max-w-[1100px]
            min-h-0
            flex-col
            overflow-hidden
            rounded-xl
            bg-white
            font-sans
            shadow-2xl
        ">

            {/* HEADER */}
            <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                        <PackageCheck size={22} className="text-blue-600" />
                    </div>

                    <div>
                        <h2 className="text-[17px] font-semibold text-gray-800">
                            Create Goods Receipt
                        </h2>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Receive goods against a purchase order
                        </p>
                    </div>
                </div>

                <span className="
                    rounded-full
                    bg-blue-50
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-blue-700
                ">
                    {purchaseOrder.orderNo}
                </span>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 min-h-0 space-y-6 overflow-y-auto px-6 py-5">

                {/* PURCHASE ORDER DETAILS */}
                <div className="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-3">

                    <div>
                        <p className="text-xs text-gray-500">
                            Purchase Order
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                            {purchaseOrder.orderNo || "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Supplier
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                            {purchaseOrder.supplierName ||
                                purchaseOrder.party?.companyName ||
                                "-"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">
                            Warehouse
                        </p>

                        <p className="mt-1 font-semibold text-gray-800">
                            {purchaseOrder.warehouseName || "-"}
                        </p>
                    </div>

                </div>

                {/* RECEIPT INFORMATION */}
                <div>
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <CalendarDays size={17} className="text-blue-600" />
                        Receipt Information
                    </h3>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                        <div>
                            <label className="mb-1.5 block text-sm text-gray-600">
                                Receipt Date <span className="text-red-500">*</span>
                            </label>

                            <input
                                type="date"
                                value={receiptDate}
                                onChange={(e) => setReceiptDate(e.target.value)}
                                className="
                                    w-full
                                    rounded-lg
                                    border border-gray-300
                                    px-3 py-2
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                "
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-sm text-gray-600">
                                Notes
                            </label>

                            <input
                                type="text"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Enter receipt notes"
                                className="
                                    w-full
                                    rounded-lg
                                    border border-gray-300
                                    px-3 py-2
                                    text-sm
                                    outline-none
                                    focus:border-blue-500
                                "
                            />
                        </div>

                    </div>
                </div>

                {/* ITEMS */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                            <ClipboardList size={17} className="text-blue-600" />
                            Items to Receive
                        </h3>

                        <span className="text-xs text-gray-500">
                            {items.length} pending item(s)
                        </span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full min-w-[850px] text-sm">

                            <thead className="bg-gray-50">
                                <tr className="text-left text-xs text-gray-600">
                                    <th className="px-4 py-3 font-semibold">
                                        Product
                                    </th>

                                    <th className="px-4 py-3 text-right font-semibold">
                                        Ordered
                                    </th>

                                    <th className="px-4 py-3 text-right font-semibold">
                                        Received
                                    </th>

                                    <th className="px-4 py-3 text-right font-semibold">
                                        Pending
                                    </th>

                                    <th className="px-4 py-3 font-semibold">
                                        Receive Qty
                                    </th>

                                    <th className="px-4 py-3 font-semibold">
                                        Unit Cost
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {items.map((item, index) => (
                                    <tr key={item.purchaseOrderItemId}>

                                        <td className="px-4 py-3">
                                            <p className="font-medium text-gray-800">
                                                {item.productName}
                                            </p>

                                            {item.description && (
                                                <p className="mt-0.5 text-xs text-gray-500">
                                                    {item.description}
                                                </p>
                                            )}

                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {item.unitName}
                                            </p>
                                        </td>

                                        <td className="px-4 py-3 text-right text-gray-600">
                                            {item.orderedQuantity}
                                        </td>

                                        <td className="px-4 py-3 text-right text-gray-600">
                                            {item.receivedQuantity}
                                        </td>

                                        <td className="px-4 py-3 text-right font-medium text-orange-600">
                                            {item.pendingQuantity}
                                        </td>

                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                max={item.pendingQuantity}
                                                step="0.0001"
                                                value={item.quantityToReceive}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "quantityToReceive",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="0"
                                                className="
                                                    w-28
                                                    rounded-lg
                                                    border border-gray-300
                                                    px-2 py-2
                                                    text-right
                                                    outline-none
                                                    focus:border-blue-500
                                                "
                                            />
                                        </td>

                                        <td className="px-4 py-3">
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={item.receivedUnitCost}
                                                onChange={(e) =>
                                                    handleItemChange(
                                                        index,
                                                        "receivedUnitCost",
                                                        e.target.value
                                                    )
                                                }
                                                className="
                                                    w-28
                                                    rounded-lg
                                                    border border-gray-300
                                                    px-2 py-2
                                                    text-right
                                                    outline-none
                                                    focus:border-blue-500
                                                "
                                            />
                                        </td>

                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>
                </div>

                {/* SUMMARY */}
                <div className="flex justify-end">
                    <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-gray-50 p-4">

                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">
                                Total Receiving Quantity
                            </span>

                            <span className="font-medium text-gray-800">
                                {totalReceivingQuantity.toFixed(4)}
                            </span>
                        </div>

                        <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                            <span className="font-semibold text-gray-700">
                                Estimated Receipt Cost
                            </span>

                            <span className="font-semibold text-gray-900">
                                {purchaseOrder.currencySymbol || "₹"}{" "}
                                {totalReceivingAmount.toFixed(2)}
                            </span>
                        </div>

                    </div>
                </div>

            </div>

            {/* FOOTER */}
            <div className="flex shrink-0 items-center justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4">

                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="
                        rounded-lg
                        border border-gray-300
                        px-5 py-2
                        text-sm font-medium
                        text-gray-700
                        hover:bg-gray-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    Cancel
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={submitting}
                    className="
                        rounded-lg
                        bg-blue-600
                        px-5 py-2
                        text-sm font-medium
                        text-white
                        transition
                        hover:bg-blue-700
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >
                    {submitting ? "Saving..." : "Save Goods Receipt"}
                </button>

            </div>
        </div>
    );
}