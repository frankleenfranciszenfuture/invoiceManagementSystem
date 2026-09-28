import React from 'react'

import ProductSubDetailsOverviewCard from "../tabs/ProductSubDetailsOverviewCard";
import ProductSalesOverviewCard from './ProductSalesOverviewCard';
import ProductPayDueOverviewCard from './ProductPayDueOverviewCard';

export default function ProductDashboardTabView() {
    return (
        <div className="px-3 py-2">
            <div className="flex gap-8">

                <div className="flex-1">
                    <ProductSubDetailsOverviewCard />
                </div>

                <div className="flex-1">
                    <ProductPayDueOverviewCard />
                    < ProductSalesOverviewCard />
                </div>

            </div>
        </div>
    );
}