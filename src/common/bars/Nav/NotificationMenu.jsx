import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Bell,
    X,
    MonitorSmartphone,
} from "lucide-react";

import { closeNotifications } from "../../../module/ui/uiSlice";
import { notifications } from "../Nav/data/notification/notificationData";

export default function NotificationMenu() {
    const dispatch = useDispatch();

    const { notificationsOpen } = useSelector((state) => state.ui);

    const menuRef = useRef(null);

    const [activeTab, setActiveTab] = useState("all");

    const filteredNotifications =
        activeTab === "all"
            ? notifications
            : notifications.filter((n) => n.type === "mentions");

    useEffect(() => {
        function handleClick(e) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target)
            ) {
                dispatch(closeNotifications());
            }
        }

        document.addEventListener("mousedown", handleClick);

        return () =>
            document.removeEventListener("mousedown", handleClick);
    }, [dispatch]);

    if (!notificationsOpen) return null;

    return (
        <>
            {/* Overlay */}

            <div
                className="fixed inset-0 z-40"
                onClick={() => dispatch(closeNotifications())}
            />

            {/* Panel */}

            <div
                ref={menuRef}
                className="
                    absolute
                    right-0
                    top-12
                    z-50
                    w-[390px]
                    h-[720px]
                    rounded-xl
                    border
                    bg-white
                    shadow-2xl
                    overflow-hidden
                "
            >
                {/* Header */}

                <div className="border-b">

                    <div className="flex items-center justify-between p-5">

                        <h2 className="text-2xl font-semibold">
                            Notifications
                        </h2>

                        <div className="flex items-center gap-4">

                            <button className="text-gray-500 hover:text-blue-600">
                                <MonitorSmartphone size={18} />
                            </button>

                            <button
                                onClick={() =>
                                    dispatch(closeNotifications())
                                }
                                className="text-red-500 hover:text-red-600"
                            >
                                <X size={18} />
                            </button>

                        </div>

                    </div>

                    {/* Tabs */}

                    <div className="flex">

                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-5 py-3 text-sm border-b-2 transition
                                ${activeTab === "all"
                                    ? "border-blue-600 text-blue-600 font-medium"
                                    : "border-transparent text-gray-500 hover:text-black"
                                }`}
                        >
                            All
                        </button>

                        <button
                            onClick={() => setActiveTab("mentions")}
                            className={`px-5 py-3 text-sm border-b-2 transition
                                ${activeTab === "mentions"
                                    ? "border-blue-600 text-blue-600 font-medium"
                                    : "border-transparent text-gray-500 hover:text-black"
                                }`}
                        >
                            Mentions
                        </button>

                    </div>

                </div>

                {/* Body */}


                {/* Body */}

                <div className="h-[610px] overflow-y-auto">

                    {filteredNotifications.length === 0 ? (

                        <div className="flex h-full flex-col items-center justify-center px-8">

                            <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-blue-50">

                                <Bell
                                    size={52}
                                    className="text-blue-500"
                                />

                            </div>

                            <h3 className="mb-3 text-2xl font-semibold text-gray-700">
                                No Notifications
                            </h3>

                            <p className="text-center leading-7 text-gray-500">
                                Uhh... There are no notifications at the moment.
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y">

                            {filteredNotifications.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        className={`flex w-full gap-4 p-5 text-left transition hover:bg-gray-50 ${!item.read ? "bg-blue-50" : ""
                                            }`}
                                    >
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">

                                            <Icon
                                                size={18}
                                                className="text-blue-600"
                                            />

                                        </div>

                                        <div className="flex-1">

                                            <h4 className="font-medium text-gray-800">
                                                {item.title}
                                            </h4>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {item.message}
                                            </p>

                                            <p className="mt-2 text-xs text-gray-400">
                                                {item.time}
                                            </p>

                                        </div>

                                        {!item.read && (
                                            <div className="mt-2 h-2 w-2 rounded-full bg-blue-600" />
                                        )}

                                    </button>
                                );
                            })}

                        </div>

                    )}

                </div>

            </div>

        </>
    );
}
