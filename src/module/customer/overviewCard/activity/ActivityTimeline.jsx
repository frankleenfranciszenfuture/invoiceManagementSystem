import React from 'react'
import { useSelector } from "react-redux";
import { FileText } from "lucide-react";
import { addRecentActivity } from "../../slices/customerSlices";


export default function ActivityTimeline() {

    const customerState = useSelector((state) => state.customer);
    const activities = useSelector(
        (state) => state.customers.recentActivities
    );

    return (

        <div className="relative px-6 py-4">
            {/* Vertical Line */}
            <div className="absolute left-[118px] top-0 bottom-0 w-[2px] bg-blue-500"></div>

            {activities.length === 0 ? (
                <div className="text-center text-gray-500 py-10">
                    No activities found.
                </div>
            ) : (
                activities.map((item) => (
                    <div key={item.id} className="relative flex mb-8">
                        {/* Date */}
                        <div className="w-24 text-right pr-4">
                            <p className="text-sm text-gray-700">{item.date}</p>
                            <p className="text-sm text-gray-500">{item.time}</p>
                        </div>

                        {/* Timeline Icon */}
                        <div className="relative flex justify-center w-8">
                            <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white">
                                <FileText size={14} className="text-blue-500" />
                            </div>
                        </div>

                        {/* Card */}
                        <div className="ml-6 flex-1 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                            <h3 className="font-medium text-gray-900">
                                {item.title}
                            </h3>

                            <p className="mt-4 text-gray-500">
                                {item.description}
                            </p>

                            <p className="mt-1 text-gray-700">
                                by{" "}
                                <span className="font-semibold">
                                    {item.user}
                                </span>

                                {item.title === "Invoice updated" && (
                                    <button className="ml-2 text-sm text-blue-600 hover:underline">
                                        View Details
                                    </button>
                                )}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}