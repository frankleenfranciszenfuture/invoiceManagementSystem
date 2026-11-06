import React from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import RegisterCreate from "../pages/RegisterCreate";
import reportApi from "../../../api/reports/reportApi";

export default function ReportRegisterPage() {
    const { module, reportCode } = useParams();

    const handleGenerate = async (request) => {
        try {
            const response = await reportApi.preview(request);

            console.log("Report response:", response);

            toast.success("Report generated successfully");

        } catch (error) {
            console.error(error);

            toast.error(
                error?.response?.data?.message ||
                "Unable to generate report"
            );
        }
    };

    return (
        <RegisterCreate
            module={module?.toUpperCase()}
            reportCode={reportCode?.toUpperCase()}
            onGenerate={handleGenerate}
        />
    );
}