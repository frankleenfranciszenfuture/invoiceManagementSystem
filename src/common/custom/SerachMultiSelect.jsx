import React from 'react'
import { useState, useEffect, useRef } from "react";

export default function SearchMultiSelect({
    selected = [],
    options = [],
    onAdd,
    onRemove,
    getOptionKey = (item) =>
        item?.id,
    getOptionLabel = (item) =>
        item?.name ?? "",
    placeholder = "Select",
    error,
    addLabel = "",
    onCreate = null,
}) {

    const [search, setSearch] =
        useState("");

    const [open, setOpen] =
        useState(false);

    const wrapperRef =
        useRef(null);


    /* =====================================================
       CLICK OUTSIDE
    ===================================================== */

    useEffect(() => {

        const handleClickOutside =
            (event) => {

                if (
                    wrapperRef.current &&
                    !wrapperRef.current.contains(
                        event.target
                    )
                ) {
                    setOpen(false);
                }

            };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    const safeSelected =
        Array.isArray(selected)
            ? selected
            : [];


    const safeOptions =
        Array.isArray(options)
            ? options
            : [];


    /* =====================================================
       FILTER
    ===================================================== */

    const filteredOptions =
        safeOptions.filter(
            (option) => {

                const label =
                    String(
                        getOptionLabel(
                            option
                        ) ?? ""
                    );

                const searchValue =
                    String(search ?? "");


                return label
                    .toLowerCase()
                    .includes(
                        searchValue.toLowerCase()
                    );

            }
        );


    /* =====================================================
       SELECTED CHECK
    ===================================================== */

    const isSelected =
        (option) => {

            const optionKey =
                getOptionKey(option);


            return safeSelected.some(
                (selectedItem) =>
                    String(
                        selectedItem
                    ) ===
                    String(
                        optionKey
                    )
            );

        };


    /* =====================================================
       SELECT
    ===================================================== */

    const handleSelect =
        (option) => {

            const key =
                getOptionKey(option);


            if (key == null) {
                return;
            }


            if (!isSelected(option)) {

                onAdd?.(key);

            }


            setSearch("");
            setOpen(true);

        };


    return (

        <div
            ref={wrapperRef}
            className="relative"
        >

            {/* SELECTED AREA */}

            <div
                className={`
                    min-h-[44px]
                    w-full
                    px-3
                    py-1.5
                    border
                    rounded-md
                    bg-white
                    cursor-text
                    flex
                    flex-wrap
                    items-center
                    gap-2

                    ${error
                        ? "border-red-400"
                        : "border-gray-300"
                    }

                    focus-within:border-[#0095FD]
                    focus-within:ring-1
                    focus-within:ring-[#0095FD]
                `}
                onClick={() =>
                    setOpen(true)
                }
            >

                {/* CHIPS */}

                {safeSelected.map(
                    (
                        selectedId,
                        index
                    ) => {

                        const selectedItem =
                            safeOptions.find(
                                (item) =>
                                    String(
                                        getOptionKey(
                                            item
                                        )
                                    ) ===
                                    String(
                                        selectedId
                                    )
                            );


                        const label =
                            selectedItem
                                ? String(
                                    getOptionLabel(
                                        selectedItem
                                    ) ?? ""
                                )
                                : String(
                                    selectedId ??
                                    ""
                                );


                        return (

                            <div
                                key={`${selectedId}-${index}`}
                                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    px-2.5
                                    py-1
                                    rounded-full
                                    bg-blue-500
                                    border
                                    border-[#0095FD]
                                    text-xs
                                    text-[#FAF9F7]
                                "
                            >

                                <span>
                                    {label}
                                </span>


                                <button
                                    type="button"
                                    onClick={(e) => {

                                        e.stopPropagation();

                                        onRemove?.(
                                            selectedId
                                        );

                                    }}
                                    className="
                                        w-4
                                        h-4
                                        flex
                                        items-center
                                        justify-center
                                        rounded-full
                                        text-[#FAF9F7]
                                        hover:bg-[#0095FD]
                                        hover:text-red-400
                                    "
                                >
                                    ×
                                </button>

                            </div>

                        );

                    }
                )}


                {/* SEARCH */}

                <input
                    type="text"
                    value={search}
                    onChange={(e) => {

                        setSearch(
                            e.target.value
                        );

                        setOpen(true);

                    }}
                    onFocus={() =>
                        setOpen(true)
                    }
                    placeholder={
                        safeSelected.length === 0
                            ? placeholder
                            : ""
                    }
                    className="
                        flex-1
                        min-w-[120px]
                        h-8
                        border-0
                        outline-none
                        text-sm
                        text-gray-700
                        placeholder:text-gray-400
                        bg-transparent
                    "
                />

            </div>


            {/* ERROR */}

            {error && (

                <p className="text-xs text-red-500 mt-1">
                    {error}
                </p>

            )}


            {/* DROPDOWN */}

            {open && (

                <div
                    className="
                        absolute
                        z-[9999]
                        left-0
                        right-0
                        mt-1
                        bg-white
                        border
                        border-gray-200
                        rounded-md
                        shadow-lg
                        overflow-hidden
                    "
                >

                    <div className="max-h-52 overflow-y-auto">

                        {filteredOptions.length >
                            0 ? (

                            filteredOptions.map(
                                (option) => {

                                    const key =
                                        getOptionKey(
                                            option
                                        );

                                    const label =
                                        String(
                                            getOptionLabel(
                                                option
                                            ) ?? ""
                                        );


                                    const selectedOption =
                                        isSelected(
                                            option
                                        );


                                    return (

                                        <button
                                            key={key}
                                            type="button"
                                            disabled={
                                                selectedOption
                                            }
                                            onClick={() =>
                                                handleSelect(
                                                    option
                                                )
                                            }
                                            className={`
                                                w-full
                                                px-3
                                                py-2.5
                                                text-left
                                                text-sm
                                                text-gray-400
                                                flex
                                                items-center
                                                justify-between

                                                ${selectedOption
                                                    ? "bg-gray-50 text-gray-100 cursor-not-allowed"
                                                    : "text-gray-100 hover:bg-[#0095FD] hover:text-gray-100"
                                                }
                                            `}
                                        >

                                            <span>
                                                {label}
                                            </span>


                                            {selectedOption && (

                                                <span className="text-xs text-gray-400">
                                                    Selected
                                                </span>

                                            )}

                                        </button>

                                    );

                                }
                            )

                        ) : (

                            <div className="px-3 py-3">

                                <div className="
                                    text-sm
                                    text-gray-400
                                    text-center
                                    mb-2
                                ">
                                    No options found
                                </div>


                                {onCreate &&
                                    search.trim() && (

                                        <button
                                            type="button"
                                            onClick={() => {

                                                onCreate(
                                                    search.trim()
                                                );

                                                setOpen(false);
                                                setSearch("");

                                            }}
                                            className="
                                                w-full
                                                px-3
                                                py-2.5
                                                rounded-md
                                                flex
                                                items-center
                                                gap-2
                                                text-left
                                                text-sm
                                                text-gray-500
                                                hover:bg-[#408DFB]
                                                hover:text-gray-100
                                            "
                                        >

                                            <span className="text-lg">
                                                +
                                            </span>

                                            <span className="font-medium">
                                                {addLabel ||
                                                    "New"}
                                            </span>

                                        </button>

                                    )}

                            </div>

                        )}

                    </div>

                </div>

            )}

        </div>

    );
}