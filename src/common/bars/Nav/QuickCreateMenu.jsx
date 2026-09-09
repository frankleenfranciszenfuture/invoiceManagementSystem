import { useSelector } from "react-redux";
import { closeQuickCreate } from "../../../module/ui/uiSlice";
import { CirclePlus, ShoppingCart, ShoppingBag } from "lucide-react";

const groups = [
    {
        title: "GENERAL",
        items: ["Add User", "Item", "Log Time", "Weekly Log"],
        icon: CirclePlus,
    },
    {
        title: "SALES",
        items: [
            "Customer",
            "Quotes",
            "Delivery Challan",
            "Invoices",
            "Retail Invoice",
            "Customer Payment",
        ],
        icon: ShoppingCart,
    },
    {
        title: "PURCHASES",
        items: ["Expenses"],
        icon: ShoppingBag,
    },
];


export default function QuickCreateMenu() {
    const { quickCreateOpen } = useSelector((state) => state.ui);

    if (!quickCreateOpen) return null;

    return (
        <div
            className="
            absolute
            right-0
            top-12
            w-[760px]
            rounded-xl
            border
            bg-white
            shadow-2xl
            p-6
            z-50
        "
        >
            < div className="grid grid-cols-3 gap-12" >
                {
                    groups.map((group) => {
                        const Icon = group.icon;

                        return (
                            <div key={group.title}>
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold mb-5">
                                    <Icon className="w-4 h-4" />
                                    {group.title}
                                </div>

                                <div className="space-y-4">
                                    {group.items.map((item) => (
                                        <button
                                            key={item}
                                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
                                        >
                                            <CirclePlus className="w-4 h-4 text-gray-400" />
                                            {item}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                }
            </div >
        </div >
    );
}