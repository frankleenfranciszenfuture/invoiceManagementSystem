
import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Bell,
    X,
    MonitorSmartphone,
    FileText,
    CreditCard,
    Package,
    Users,
    AlertCircle,
    CheckCheck,
    Loader2,
} from "lucide-react";

import { closeNotifications } from "../../../module/ui/uiSlice";

import {
    fetchNotifications,
    fetchUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "../../notification/thunks/notificationThunks";

// =====================================================
// HELPERS
// =====================================================

const getNotificationIcon = (moduleName) => {
    const icons = {
        INVOICES: FileText,
        INVOICE: FileText,
        PAYMENTS: CreditCard,
        PAYMENT: CreditCard,
        INVENTORY: Package,
        CUSTOMERS: Users,
        CUSTOMER: Users,
        PARTIES: Users,
        PARTY: Users,
    };

    return icons[moduleName?.toUpperCase()] || Bell;
};

const formatNotificationTime = (date) => {
    if (!date) return "";

    const notificationDate = new Date(date);

    if (Number.isNaN(notificationDate.getTime())) return "";

    const now = new Date();
    const difference = now - notificationDate;

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(difference / 3600000);
    const days = Math.floor(difference / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} days ago`;

    return notificationDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

// =====================================================
// COMPONENT
// =====================================================

export default function NotificationMenu() {
    const dispatch = useDispatch();

    const { notificationsOpen } = useSelector((state) => state.ui);

    const {
        notifications,
        unreadCount,
        loading,
        actionLoading,
    } = useSelector((state) => state.notifications);

    const menuRef = useRef(null);

    const [activeTab, setActiveTab] = useState("all");

    // =================================================
    // FETCH NOTIFICATIONS
    // =================================================

    useEffect(() => {
        if (!notificationsOpen) return;

        dispatch(fetchNotifications({
            page: 0,
            size: 20,
        }));

        dispatch(fetchUnreadNotificationCount());
    }, [dispatch, notificationsOpen]);

    // =================================================
    // CLOSE ON OUTSIDE CLICK
    // =================================================

    useEffect(() => {
        if (!notificationsOpen) return;

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
    }, [dispatch, notificationsOpen]);

    // =================================================
    // FILTER NOTIFICATIONS
    // =================================================

    const notificationList = notifications?.content || [];

    const filteredNotifications = useMemo(() => {
        if (activeTab === "unread") {
            return notificationList.filter(
                (notification) => !notification.read,
            );
        }

        return notificationList;
    }, [notificationList, activeTab]);

    // =================================================
    // MARK AS READ
    // =================================================

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            dispatch(markNotificationAsRead(notification.id))
                .then((result) => {
                    if (markNotificationAsRead.fulfilled.match(result)) {
                        dispatch(fetchUnreadNotificationCount());
                    }
                });
        }
        if (notification.actionUrl) {
            dispatch(closeNotifications());
            navigate(notification.actionUrl);
        }
        if (notification.actionUrl) {
            dispatch(closeNotifications());

            // Navigate using your application's routing.
            // Add useNavigate() if this component is inside BrowserRouter.
        }
    };

    // =================================================
    // MARK ALL AS READ
    // =================================================

    const handleMarkAllAsRead = () => {
        if (unreadCount === 0) return;

        dispatch(markAllNotificationsAsRead())
            .then((result) => {
                if (markAllNotificationsAsRead.fulfilled.match(result)) {
                    dispatch(fetchUnreadNotificationCount());
                    dispatch(fetchNotifications({
                        page: 0,
                        size: 20,
                    }));
                }
            });
    };

    // =================================================
    // CLOSED STATE
    // =================================================

    if (!notificationsOpen) return null;

    // =================================================
    // RENDER
    // =================================================

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
                    h-[520px]
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

                        <div className="flex items-center gap-2">

                            <h2 className="text-2xl font-semibold">
                                Notifications
                            </h2>

                            {unreadCount > 0 && (
                                <span className="
                                    flex h-6 min-w-6 items-center
                                    justify-center rounded-full
                                    bg-blue-100 px-2 text-xs
                                    font-semibold text-blue-600
                                ">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}

                        </div>

                        <div className="flex items-center gap-4">

                            <button
                                type="button"
                                title="Mark all as read"
                                onClick={handleMarkAllAsRead}
                                disabled={unreadCount === 0 || actionLoading}
                                className="
                                    text-gray-500
                                    hover:text-blue-600
                                    disabled:cursor-not-allowed
                                    disabled:opacity-40
                                "
                            >
                                <CheckCheck size={19} />
                            </button>

                            <button
                                type="button"
                                title="Notification settings"
                                className="text-gray-500 hover:text-blue-600"
                            >
                                <MonitorSmartphone size={18} />
                            </button>

                            <button
                                type="button"
                                onClick={() => dispatch(closeNotifications())}
                                className="text-red-500 hover:text-red-600"
                            >
                                <X size={18} />
                            </button>

                        </div>

                    </div>

                    {/* Tabs */}

                    <div className="flex">

                        <button
                            type="button"
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
                            type="button"
                            onClick={() => setActiveTab("unread")}
                            className={`flex items-center gap-2 px-5 py-3 text-sm border-b-2 transition
                                ${activeTab === "unread"
                                    ? "border-blue-600 text-blue-600 font-medium"
                                    : "border-transparent text-gray-500 hover:text-black"
                                }`}
                        >
                            Unread

                            {unreadCount > 0 && (
                                <span className="text-xs">
                                    ({unreadCount})
                                </span>
                            )}
                        </button>

                    </div>

                </div>

                {/* Body */}

                <div className="h-[610px] overflow-y-auto">

                    {loading ? (

                        <div className="flex h-full flex-col items-center justify-center">

                            <Loader2
                                size={35}
                                className="animate-spin text-blue-600"
                            />

                            <p className="mt-4 text-sm text-gray-500">
                                Loading notifications...
                            </p>

                        </div>

                    ) : filteredNotifications.length === 0 ? (

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
                                {activeTab === "unread"
                                    ? "You're all caught up. There are no unread notifications."
                                    : "Uhh... There are no notifications at the moment."
                                }
                            </p>

                        </div>

                    ) : (

                        <div className="divide-y">

                            {filteredNotifications.map((item) => {
                                const Icon = getNotificationIcon(item.moduleName);

                                return (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`
                                            flex w-full gap-4 p-5
                                            text-left transition
                                            hover:bg-gray-50
                                            ${!item.read ? "bg-blue-50" : ""}
                                        `}
                                    >
                                        {/* Icon */}

                                        <div className="
                                            flex h-10 w-10 shrink-0
                                            items-center justify-center
                                            rounded-full bg-blue-100
                                        ">

                                            <Icon
                                                size={18}
                                                className="text-blue-600"
                                            />

                                        </div>

                                        {/* Content */}

                                        <div className="min-w-0 flex-1">

                                            <div className="flex items-start justify-between gap-2">

                                                <h4 className="font-medium text-gray-800">
                                                    {item.title}
                                                </h4>

                                                {item.priority === "HIGH" && (
                                                    <span className="
                                                        shrink-0 rounded-full
                                                        bg-red-100 px-2 py-0.5
                                                        text-[10px] font-semibold
                                                        text-red-600
                                                    ">
                                                        High
                                                    </span>
                                                )}

                                                {item.priority === "URGENT" && (
                                                    <span className="
                                                        shrink-0 rounded-full
                                                        bg-red-100 px-2 py-0.5
                                                        text-[10px] font-semibold
                                                        text-red-600
                                                    ">
                                                        Urgent
                                                    </span>
                                                )}

                                            </div>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {item.message}
                                            </p>

                                            <div className="mt-2 flex items-center justify-between">

                                                <p className="text-xs text-gray-400">
                                                    {formatNotificationTime(
                                                        item.audit?.createdAt,
                                                    )}
                                                </p>

                                                {item.moduleName && (
                                                    <span className="
                                                        text-[10px]
                                                        font-medium
                                                        uppercase
                                                        tracking-wide
                                                        text-gray-400
                                                    ">
                                                        {item.moduleName.replaceAll("_", " ")}
                                                    </span>
                                                )}

                                            </div>

                                        </div>

                                        {/* Unread Indicator */}

                                        {!item.read && (
                                            <div className="
                                                mt-2 h-2 w-2 shrink-0
                                                rounded-full bg-blue-600
                                            " />
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
