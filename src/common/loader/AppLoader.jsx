import { Loader2 } from "lucide-react";
import { assets } from "../../assets/assets";

const AppLoader = ({ text = "Loading..." }) => {
    return (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center">
            <img src={assets.zenfutureLogo} className="h-20 mb-6" />

            <h2 className="text-2xl font-bold text-gray-800">
                Invoice Management
            </h2>

            <Loader2 className="mt-8 h-10 w-10 animate-spin text-blue-600" />

            <p className="mt-4 text-gray-500">
                Loading your workspace...
            </p>
        </div>
    );
};

export default AppLoader;