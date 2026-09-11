import React from 'react'

export default function BottomActionBarItemMaster({ onSave, onCancel, onSubmit }) {

    return (
        // className="h-[60px] border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0
        <div className="fixed bottom-0 left-61 right-0 bg-white border-t border-gray-200 shadow-md px-4 py-4">
            <div className="flex justify-start gap-3">

                <button
                    onClick={onSave}
                    className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-900"
                >
                    Save
                </button>

                <button
                    onClick={onSubmit}
                    className="px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-900"
                >
                    Save as Draft
                </button>


                <button
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                    Cancel
                </button>


                {/* <button
                    onClick={onSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Submit
                </button> */}
            </div>
        </div>
    );
}
