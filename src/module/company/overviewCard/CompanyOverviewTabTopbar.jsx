import React from "react";

import {
    FolderClock,
    Paperclip,
    SquarePenIcon,
    SquareX,
} from "lucide-react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import {
    setExsistingCompany,
} from "../slices/companySlice";

import { openModal } from "../../ui/uiSlice";

export default function CompanyOverviewTabTopbar() {

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // =========================================================
    // COMPANY STATE
    // =========================================================

    const company = useSelector(
        (state) => state.company?.company
    );

    const existingCompany = useSelector(
        (state) => state.company?.existingCompany
    );

    const currentCompany =
        existingCompany?.companyName
            ? existingCompany
            : company?.companyName
                ? company
                : null;

    // =========================================================
    // LOADING
    // =========================================================

    if (!currentCompany) {
        return (
            <div className="flex items-center justify-between border border-gray-100 bg-white px-5 py-5">
                <h1 className="text-2xl font-medium text-gray-400">
                    Loading...
                </h1>
            </div>
        );
    }



    // =========================================================
    // EDIT COMPANY
    // =========================================================

    const handleEdit = () => {
        if (!currentCompany?.id) {
            return;
        }

        dispatch(
            setExsistingCompany({
                ...currentCompany,
            })
        );

        dispatch(
            openModal({
                type: "editCompany",
                data: {
                    ...currentCompany,
                },
            })
        );
    };

    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            className="
                flex
                items-center
                justify-between
                border
                border-gray-100
                bg-white
                px-5
                py-5
            "
        >

            {/* =================================================
                LEFT - COMPANY NAME
            ================================================= */}

            <div
                className="
                    flex
                    cursor-pointer
                    items-center
                    gap-1
                "
            >

                <div>

                    <h1
                        onClick={() => navigate("/companies")}
                        className="
        cursor-pointer
        text-4xl
        font-medium
        leading-none
        text-gray-900
        transition-colors
        hover:text-blue-600
    "
                    >
                        {currentCompany.companyName}
                    </h1>

                </div>

            </div>

            {/* =================================================
                RIGHT - ACTION BUTTONS
            ================================================= */}

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                {/* =================================================
                    EDIT
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        onClick={
                            handleEdit
                        }
                        className="
                            flex
                            items-center
                            gap-1
                            rounded
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-400
                        "
                    >

                        <SquarePenIcon
                            size={16}
                        />

                        <span>
                            Edit
                        </span>

                    </button>

                </div>

                {/* =================================================
                    ATTACHMENT
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        className="
                            flex
                            items-center
                            gap-1
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-400
                        "
                    >

                        <Paperclip
                            size={16}
                        />

                    </button>

                </div>

                {/* =================================================
                    HISTORY
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        className="
                            flex
                            items-center
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-blue-400
                        "
                    >

                        <FolderClock
                            size={16}
                        />

                    </button>

                </div>

                {/* =================================================
                    CLOSE
                ================================================= */}

                <div
                    className="
                        flex
                        cursor-pointer
                        overflow-hidden
                        rounded-sm
                        border
                        border-blue-600
                        bg-blue-500
                        shadow-sm
                    "
                >

                    <button
                        type="button"
                        className="
                            flex
                            items-center
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-white
                            hover:bg-red-800
                        "
                    >

                        <SquareX
                            size={16}
                        />

                    </button>

                </div>

            </div>

        </div>

    );
}