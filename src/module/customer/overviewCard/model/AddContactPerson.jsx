import React from 'react'
import { useDispatch, useSelector } from "react-redux";
import { closeModal } from "../../../ui/uiSlice";
import { setContactField, resetContactForm } from "../../../customer/slices/customerSlices";

export default function AddContactPerson() {

    const dispatch = useDispatch();

    const { modal } = useSelector((state) => state.ui);
    const { contactForm } = useSelector((state) => state.customers);

    // only render when active
    if (modal.type !== "addContactPerson" || !modal.open) return null;

    const handleClose = () => {
        dispatch(closeModal());
        dispatch(resetContactForm());
    };

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-[1000px] bg-white rounded-md shadow-xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-300 px-6 py-4">
                    <h2 className="text-2xl font-medium">Add Contact Person</h2>

                    <button
                        onClick={handleClose}
                        className="text-red-500 text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="flex">

                    {/* LEFT */}
                    <div className="flex-1 p-6">

                        {/* Name */}
                        <div className="grid grid-cols-[170px_1fr] gap-4 items-center mb-4">

                            <label>Name</label>

                            <div className="grid grid-cols-3 gap-3 ">

                                <select
                                    value={contactForm.salutation ?? ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "salutation",
                                                value: e.target.value,
                                            })
                                        )
                                    }
                                    className="border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="">Salutation</option>
                                    <option>Mr.</option>
                                    <option>Mrs.</option>
                                    <option>Ms.</option>
                                </select>

                                <input
                                    placeholder="First Name"
                                    value={contactForm.firstName ?? ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "firstName",
                                                value: e.target.value,
                                            })
                                        )
                                    }
                                    className="border border-gray-300 rounded px-3 py-2"
                                />

                                <input
                                    placeholder="Last Name"
                                    value={contactForm.lastName ?? ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "lastName",
                                                value: e.target.value,
                                            })
                                        )
                                    }
                                    className="border border-gray-300 rounded px-3 py-2"
                                />

                            </div>

                        </div>

                        {/* Email */}
                        <div className="grid grid-cols-[170px_1fr] gap-4 items-center mb-4">

                            <label>Email Address</label>

                            <input
                                placeholder="Email Address"
                                value={contactForm.email ?? ""}
                                onChange={(e) =>
                                    dispatch(
                                        setContactField({
                                            field: "email",
                                            value: e.target.value,
                                        })
                                    )
                                }
                                className="border border-gray-300 rounded px-3 py-2"
                            />

                        </div>

                        {/* Work Phone */}
                        <div className="grid grid-cols-[170px_1fr] gap-4 items-center mb-4">

                            <label>Phone</label>

                            <div className="flex gap-3">

                                <select className="w-20 border border-gray-300 rounded px-2">
                                    <option>+91</option>
                                </select>

                                <input
                                    placeholder="Work Phone"
                                    value={contactForm.workPhone ?? ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "workPhone",
                                                value: e.target.value,
                                            })
                                        )
                                    }
                                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                                />

                            </div>

                        </div>

                        {/* Mobile */}
                        <div className="grid grid-cols-[170px_1fr] gap-4 items-center mb-4">

                            <label></label>

                            <div className="flex gap-3">

                                <select className="w-20 border border-gray-300 rounded px-2">
                                    <option>+91</option>
                                </select>

                                <input
                                    placeholder="Mobile"
                                    value={contactForm.mobile ?? ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "mobile",
                                                value: e.target.value,
                                            })
                                        )
                                    }
                                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                                />

                            </div>

                        </div>

                        {/* Skype */}
                        <div className="grid grid-cols-[170px_1fr] gap-4 items-center mb-4">

                            <label>Skype Name/Number</label>

                            <input
                                placeholder="Skype Name/Number"
                                value={contactForm.skype ?? ""}
                                onChange={(e) =>
                                    dispatch(
                                        setContactField({
                                            field: "skype",
                                            value: e.target.value,
                                        })
                                    )
                                }
                                className="border border-gray-300 rounded px-3 py-2"
                            />

                        </div>

                        {/* Other */}
                        <div className="grid grid-cols-[170px_1fr] gap-4 items-center">

                            <label>Other Details</label>

                            <div className="grid grid-cols-2 gap-3">

                                <input
                                    placeholder="Designation"
                                    value={contactForm.designation ?? ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "designation",
                                                value: e.target.value,
                                            })
                                        )
                                    }
                                    className="border border-gray-300 rounded px-3 py-2"
                                />

                                <input
                                    placeholder="Department"
                                    value={contactForm.department ?? ""}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "department",
                                                value: e.target.value,
                                            })
                                        )
                                    }
                                    className="border border-gray-300 rounded px-3 py-2"
                                />

                            </div>

                        </div>

                        {/* <div className="border-t border-gray-300 mt-8 pt-5">

                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={contactForm.portalAccess ?? false}
                                    onChange={(e) =>
                                        dispatch(
                                            setContactField({
                                                field: "portalAccess",
                                                value: e.target.checked,
                                            })
                                        )
                                    }
                                />
                                Enable portal access
                            </label>

                            <p className="text-sm text-gray-500 mt-2">
                                This customer will be able to log in and view transactions.
                            </p>

                        </div> */}

                    </div>

                    {/* RIGHT */}
                    <div className="w-72 border-l border-gray-300 p-6">

                        <div className="border-2 border-dashed border-gray-300 rounded-lg h-64 flex flex-col items-center justify-center text-center">

                            <div className="text-4xl text-blue-500 mb-3">⬆</div>

                            <p className="font-medium">
                                Drag & Drop Profile Image
                            </p>

                            <p className="text-sm text-gray-500 mt-2">
                                jpg, jpeg, png, gif, bmp
                            </p>

                            <p className="text-sm text-gray-500">
                                Maximum File Size: 5MB
                            </p>

                            <button className="mt-5 text-blue-600 underline">
                                Upload File
                            </button>

                        </div>

                    </div>

                </div>

                {/* Footer */}
                <div className="border-t border-gray-300 px-6 py-4 flex gap-3">

                    <button className="bg-blue-600 text-white px-6 py-2 rounded">
                        Save
                    </button>

                    <button
                        onClick={handleClose}
                        className="border border-gray-300 px-6 py-2 rounded"
                    >
                        Cancel
                    </button>

                </div>

            </div>
        </div>
    );
}