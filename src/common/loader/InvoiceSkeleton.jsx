import { FileText, LoaderCircle } from 'lucide-react';
import React from 'react'

export default function InvoiceSkeleton() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center">
            <div className="relative">
                <FileText className="h-16 w-16 text-blue-600" />
                <LoaderCircle className="absolute -bottom-2 -right-2 h-8 w-8 animate-spin text-blue-500" />
            </div>

            <p className="mt-5 text-lg font-semibold text-gray-700">
                Generating Invoice
            </p>

            <p className="mt-1 text-sm text-gray-500">
                Please wait while we prepare your invoice...
            </p>
        </div>
    );
};