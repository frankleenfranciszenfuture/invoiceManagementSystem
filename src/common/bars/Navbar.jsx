import React from "react";

import { useSelector } from "react-redux";
import { FileText } from "lucide-react";

import QuickCreateButton from "../../common/bars/Nav/QuickCreateButton";
import NotificationButton from "../../common/bars/Nav/NotificationButton";
import SettingsButton from "../../common/bars/Nav/SettingsButton";
import ProfileButton from "../../common/bars/Nav/ProfileButton";


export default function Navbar({ title }) {

    const open = useSelector((s) => s.ui.sidebarOpen);

    const user = useSelector((state) => state.auth.user);


    return (
        <div className="h-[60px] border-b border-gray-200 flex items-center justify-between px-4 bg-white">

            <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-400" />
                </div>

                <div>
                    <h1 className="text-2xl font-medium text-blue-800">
                        Hello, {user?.name?.split(" ")[0]}
                    </h1>

                    <p className="text-sm text-gray-500">
                        Today is{" "}
                        {new Date().toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <QuickCreateButton />
                <NotificationButton />
                <SettingsButton />
                <ProfileButton />
            </div>

        </div>
    );
}