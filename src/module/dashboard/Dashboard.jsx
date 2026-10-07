// import React from "react";
// import {
//     ArrowDownRight,
//     ArrowUpRight,
//     BarChart3,
//     Globe2,
//     Mail,
//     Package,
//     ShoppingCart,
//     Tags,
//     Target,
//     Users,
// } from "lucide-react";

// import {
//     Area,
//     AreaChart,
//     ResponsiveContainer,
//     Tooltip,
//     XAxis,
//     YAxis,
// } from "recharts";

// import {
//     ComposableMap,
//     Geographies,
//     Geography,
// } from "react-simple-maps";


// /* =========================================================
//    SAMPLE DATA
// ========================================================= */

// const dashboardData = {
//     summary: {
//         quotations: {
//             value: 24,
//             previousValue: 20,
//             percentageChange: 20.0,
//         },
//         orders: {
//             value: 100,
//             previousValue: 85,
//             percentageChange: 17.65,
//         },
//         revenue: {
//             value: 255000,
//             previousValue: 230000,
//             percentageChange: 10.87,
//         },
//         averageOrder: {
//             value: 2550,
//             previousValue: 2705.88,
//             percentageChange: -5.76,
//         },
//     },

//     monthlySales: [
//         {
//             month: "2026-08",
//             label: "August 2026",
//             revenue: 125000,
//         },
//         {
//             month: "2026-09",
//             label: "September 2026",
//             revenue: 255000,
//         },
//     ],

//     topQuotations: [
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Michael Admin",
//             amount: 25000,
//         },
//         {
//             customerName: "Randy Max",
//             salespersonName: "Michael Admin",
//             amount: 19250,
//         },
//         {
//             customerName: "Garbin Furniture",
//             salespersonName: "Marc Demo",
//             amount: 17200,
//         },
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Marc Demo",
//             amount: 14700,
//         },
//         {
//             customerName: "Toshiba Company, SA",
//             salespersonName: "Michael Admin",
//             amount: 12500,
//         },
//         {
//             customerName: "Randy Max",
//             salespersonName: "Michael Admin",
//             amount: 11750,
//         },
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Marc Demo",
//             amount: 10500,
//         },
//         {
//             customerName: "Garbin Furniture",
//             salespersonName: "Marc Demo",
//             amount: 9250,
//         },
//         {
//             customerName: "MEJA",
//             salespersonName: "Michael Admin",
//             amount: 8920,
//         },
//     ],

//     topSalesOrders: [
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Michael Admin",
//             amount: 22100,
//         },
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Marc Demo",
//             amount: 19000,
//         },
//         {
//             customerName: "Randy Max",
//             salespersonName: "Michael Admin",
//             amount: 14600,
//         },
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Michael Admin",
//             amount: 12800,
//         },
//         {
//             customerName: "Randy Max",
//             salespersonName: "Michael Admin",
//             amount: 11400,
//         },
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Michael Admin",
//             amount: 10500,
//         },
//         {
//             customerName: "Acme Corporation",
//             salespersonName: "Michael Admin",
//             amount: 9800,
//         },
//         {
//             customerName: "GepinWood",
//             salespersonName: "Michael Admin",
//             amount: 9100,
//         },
//     ],

//     topCountries: [
//         {
//             countryCode: "US",
//             countryName: "United States",
//             orders: 20,
//             revenue: 95000,
//         },
//         {
//             countryCode: "IN",
//             countryName: "India",
//             orders: 18,
//             revenue: 72000,
//         },
//         {
//             countryCode: "DE",
//             countryName: "Germany",
//             orders: 12,
//             revenue: 41000,
//         },
//     ],

//     topProducts: [
//         {
//             productName: "Large Desk (Wood)",
//             orders: 7,
//             revenue: 19142,
//         },
//         {
//             productName: "Fabric Installation",
//             orders: 1,
//             revenue: 9400,
//         },
//         {
//             productName: "Sofa",
//             orders: 1,
//             revenue: 7200,
//         },
//         {
//             productName: "Customer Care (Rapid Hours)",
//             orders: 3,
//             revenue: 6100,
//         },
//         {
//             productName: "Spool Panel Installation",
//             orders: 1,
//             revenue: 3120,
//         },
//         {
//             productName: "Interior Designing",
//             orders: 1,
//             revenue: 3000,
//         },
//         {
//             productName: "Furniture Assembly",
//             orders: 1,
//             revenue: 2900,
//         },
//         {
//             productName: "Mobile",
//             orders: 3,
//             revenue: 2100,
//         },
//         {
//             productName: "Technical Maintenance",
//             orders: 3,
//             revenue: 1800,
//         },
//     ],

//     topCustomers: [
//         {
//             customerName: "Garbin Furniture",
//             orders: 20,
//             revenue: 52750,
//         },
//         {
//             customerName: "Randy Max",
//             orders: 1,
//             revenue: 30250,
//         },
//         {
//             customerName: "OpenWood",
//             orders: 1,
//             revenue: 25000,
//         },
//         {
//             customerName: "Wood Care, Ron Gibson",
//             orders: 1,
//             revenue: 15000,
//         },
//         {
//             customerName: "Toshiba Company, SA",
//             orders: 7,
//             revenue: 12750,
//         },
//         {
//             customerName: "Acme Corporation",
//             orders: 1,
//             revenue: 10000,
//         },
//         {
//             customerName: "Wood Cover, William Fletcher",
//             orders: 2,
//             revenue: 9000,
//         },
//         {
//             customerName: "MEJA",
//             orders: 1,
//             revenue: 7770,
//         },
//         {
//             customerName: "Lumber Inc",
//             orders: 1,
//             revenue: 7500,
//         },
//         {
//             customerName: "Randy, Macy Billy Fox",
//             orders: 1,
//             revenue: 5900,
//         },
//     ],

//     topCategories: [
//         {
//             categoryName: "Furniture / Chairs",
//             orders: 35,
//             revenue: 125000,
//         },
//     ],

//     topSalesTeams: [
//         {
//             salesTeamName: "Website",
//             orders: 14,
//             revenue: 190000,
//         },
//         {
//             salesTeamName: "Pro-Sales",
//             orders: 4,
//             revenue: 82750,
//         },
//         {
//             salesTeamName: "Retail Store",
//             orders: 2,
//             revenue: 27000,
//         },
//     ],

//     topSalespeople: [
//         {
//             salespersonName: "Marc Demo",
//             orders: 20,
//             revenue: 222061,
//         },
//         {
//             salespersonName: "Goldsmith",
//             orders: 12,
//             revenue: 48000,
//         },
//         {
//             salespersonName: "Michael Admin",
//             orders: 74,
//             revenue: 525500,
//         },
//     ],

//     topSources: [
//         {
//             sourceName: "Sale Promotion 1",
//             orders: 21,
//             revenue: 24754.6,
//         },
//     ],

//     topMediums: [
//         {
//             mediumName: "Email",
//             orders: 21,
//             revenue: 24754.6,
//         },
//     ],
// };


// /* =========================================================
//    HELPERS
// ========================================================= */

// const currency = (value) =>
//     new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "USD",
//         maximumFractionDigits: 2,
//     }).format(value);

// const number = (value) =>
//     new Intl.NumberFormat("en-US").format(value);


// /* =========================================================
//    KPI CARD
// ========================================================= */

// function SummaryCard({
//     title,
//     value,
//     percentage,
//     icon,
//     currencyValue = false,
// }) {
//     const positive = percentage >= 0;

//     return (
//         <div className="bg-white border border-gray-200 rounded-md px-3 py-2.5 min-w-0">

//             <div className="flex justify-between items-start">

//                 <div className="min-w-0">

//                     <p className="text-[9px] text-gray-500 truncate">
//                         {title}
//                     </p>

//                     <p className="text-[20px] leading-6 font-semibold text-gray-800 mt-0.5">
//                         {currencyValue
//                             ? currency(value)
//                             : number(value)}
//                     </p>

//                 </div>

//                 <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center">
//                     {icon}
//                 </div>

//             </div>

//             <div className="flex items-center gap-0.5 mt-1">

//                 {positive ? (
//                     <ArrowUpRight
//                         size={10}
//                         className="text-green-500"
//                     />
//                 ) : (
//                     <ArrowDownRight
//                         size={10}
//                         className="text-red-500"
//                     />
//                 )}

//                 <span
//                     className={`text-[8px] font-medium ${positive
//                         ? "text-green-500"
//                         : "text-red-500"
//                         }`}
//                 >
//                     {Math.abs(percentage).toFixed(2)}%
//                 </span>

//                 <span className="text-[8px] text-gray-400 ml-0.5">
//                     vs last period
//                 </span>

//             </div>

//         </div>
//     );
// }


// /* =========================================================
//    SECTION HEADER
// ========================================================= */

// function SectionHeader({
//     title,
//     right,
// }) {
//     return (
//         <div className="flex items-center justify-between mb-1.5">

//             <h3 className="text-[11px] font-semibold text-gray-700">
//                 {title}
//             </h3>

//             {right && (
//                 <span className="text-[8px] text-gray-400">
//                     {right}
//                 </span>
//             )}

//         </div>
//     );
// }


// /* =========================================================
//    COMPACT TABLE
// ========================================================= */

// function CompactTable({
//     columns,
//     rows,
// }) {
//     return (
//         <div className="w-full">

//             <div
//                 className="grid bg-gray-50 border-y border-gray-100 py-1 px-1"
//                 style={{
//                     gridTemplateColumns: columns
//                         .map((column) => column.width || "1fr")
//                         .join(" "),
//                 }}
//             >

//                 {columns.map((column) => (
//                     <div
//                         key={column.key}
//                         className={`text-[8px] font-medium text-gray-500 ${column.align === "right"
//                             ? "text-right"
//                             : ""
//                             }`}
//                     >
//                         {column.label}
//                     </div>
//                 ))}

//             </div>

//             {rows.map((row, index) => (

//                 <div
//                     key={index}
//                     className={`grid px-1 py-[3px] ${index === 0
//                         ? "bg-gray-50"
//                         : ""
//                         }`}
//                     style={{
//                         gridTemplateColumns: columns
//                             .map((column) => column.width || "1fr")
//                             .join(" "),
//                     }}
//                 >

//                     {columns.map((column) => (

//                         <div
//                             key={column.key}
//                             className={`text-[8px] truncate ${column.align === "right"
//                                 ? "text-right"
//                                 : "text-gray-600"
//                                 }`}
//                         >

//                             {column.render
//                                 ? column.render(row)
//                                 : row[column.key]}

//                         </div>

//                     ))}

//                 </div>

//             ))}

//         </div>
//     );
// }


// /* =========================================================
//    MONTHLY SALES
// ========================================================= */

// function MonthlySales({ data }) {
//     return (
//         <div className="mb-3">

//             <SectionHeader title="Monthly Sales" />

//             <div className="h-[185px]">

//                 <ResponsiveContainer
//                     width="100%"
//                     height="100%"
//                 >

//                     <AreaChart
//                         data={data}
//                         margin={{
//                             top: 5,
//                             right: 5,
//                             left: 5,
//                             bottom: 0,
//                         }}
//                     >

//                         <defs>
//                             <linearGradient
//                                 id="salesGradient"
//                                 x1="0"
//                                 y1="0"
//                                 x2="0"
//                                 y2="1"
//                             >
//                                 <stop
//                                     offset="0%"
//                                     stopOpacity={0.35}
//                                 />

//                                 <stop
//                                     offset="100%"
//                                     stopOpacity={0.02}
//                                 />
//                             </linearGradient>
//                         </defs>

//                         <XAxis
//                             dataKey="label"
//                             tick={{
//                                 fontSize: 8,
//                             }}
//                             axisLine={{
//                                 stroke: "#e5e7eb",
//                             }}
//                             tickLine={false}
//                         />

//                         <YAxis
//                             tick={{
//                                 fontSize: 8,
//                             }}
//                             tickFormatter={(value) =>
//                                 `${Math.round(value / 1000)}k`
//                             }
//                             axisLine={false}
//                             tickLine={false}
//                         />

//                         <Tooltip
//                             formatter={(value) =>
//                                 currency(value)
//                             }
//                         />

//                         <Area
//                             type="linear"
//                             dataKey="revenue"
//                             strokeWidth={1}
//                             fill="url(#salesGradient)"
//                             fillOpacity={1}
//                         />

//                     </AreaChart>

//                 </ResponsiveContainer>

//             </div>

//         </div>
//     );
// }


// /* =========================================================
//    COUNTRY MAP
// ========================================================= */

// function CountryMap({ data }) {
//     return (
//         <div className="relative h-[190px]">

//             <ComposableMap
//                 projectionConfig={{
//                     scale: 125,
//                 }}
//                 width={500}
//                 height={250}
//                 style={{
//                     width: "100%",
//                     height: "100%",
//                 }}
//             >

//                 <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">

//                     {({ geographies }) =>
//                         geographies.map((geo) => (

//                             <Geography
//                                 key={geo.rsmKey}
//                                 geography={geo}
//                                 style={{
//                                     default: {
//                                         fill: "#f3f4f6",
//                                         stroke: "#ffffff",
//                                         strokeWidth: 0.3,
//                                         outline: "none",
//                                     },
//                                     hover: {
//                                         fill: "#dbeafe",
//                                         outline: "none",
//                                     },
//                                     pressed: {
//                                         outline: "none",
//                                     },
//                                 }}
//                             />

//                         ))
//                     }

//                 </Geographies>

//             </ComposableMap>

//             <div className="absolute left-1 bottom-2 text-[7px] text-gray-400">
//                 Revenue
//             </div>

//         </div>
//     );
// }


// /* =========================================================
//    CATEGORY BLOCK
// ========================================================= */

// function CategoryBlock({ data }) {
//     const total = data.reduce(
//         (sum, item) => sum + item.revenue,
//         0
//     );

//     return (
//         <div className="h-[190px] flex flex-col">

//             {data.map((item, index) => {

//                 const percentage =
//                     total === 0
//                         ? 0
//                         : (item.revenue / total) * 100;

//                 return (
//                     <div
//                         key={index}
//                         className="flex-1 relative bg-gray-700 border border-white"
//                         style={{
//                             flexBasis: `${percentage}%`,
//                         }}
//                     >

//                         <div className="absolute bottom-1 left-1">

//                             <p className="text-[8px] text-white font-medium">
//                                 {item.categoryName}
//                             </p>

//                             <p className="text-[7px] text-white/70">
//                                 {currency(item.revenue)}
//                             </p>

//                         </div>

//                     </div>
//                 );
//             })}

//         </div>
//     );
// }


// /* =========================================================
//    DASHBOARD
// ========================================================= */

// export default function Dashboard() {

//     const data = dashboardData;

//     return (
//         <div className="w-full min-h-screen bg-white px-4 py-3">

//             {/* =================================================
//           SUMMARY
//       ================================================= */}

//             <div className="grid grid-cols-4 gap-2 mb-3">

//                 <SummaryCard
//                     title="Quotations"
//                     value={data.summary.quotations.value}
//                     percentage={
//                         data.summary.quotations.percentageChange
//                     }
//                     icon={
//                         <Target
//                             size={13}
//                             className="text-gray-500"
//                         />
//                     }
//                 />

//                 <SummaryCard
//                     title="Orders"
//                     value={data.summary.orders.value}
//                     percentage={
//                         data.summary.orders.percentageChange
//                     }
//                     icon={
//                         <ShoppingCart
//                             size={13}
//                             className="text-gray-500"
//                         />
//                     }
//                 />

//                 <SummaryCard
//                     title="Revenue"
//                     value={data.summary.revenue.value}
//                     percentage={
//                         data.summary.revenue.percentageChange
//                     }
//                     currencyValue
//                     icon={
//                         <BarChart3
//                             size={13}
//                             className="text-gray-500"
//                         />
//                     }
//                 />

//                 <SummaryCard
//                     title="Average Order"
//                     value={data.summary.averageOrder.value}
//                     percentage={
//                         data.summary.averageOrder.percentageChange
//                     }
//                     currencyValue
//                     icon={
//                         <TrendingIcon
//                             size={13}
//                             className="text-gray-500"
//                         />
//                     }
//                 />

//             </div>


//             {/* =================================================
//           MONTHLY SALES
//       ================================================= */}

//             <MonthlySales
//                 data={data.monthlySales}
//             />


//             {/* =================================================
//           ROW 1
//       ================================================= */}

//             <div className="grid grid-cols-2 gap-5 mb-3">

//                 <div>

//                     <SectionHeader
//                         title="Top Quotations"
//                         right="Customer        Salesperson       Revenue"
//                     />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "customerName",
//                                 label: "Customer",
//                                 width: "45%",
//                             },
//                             {
//                                 key: "salespersonName",
//                                 label: "Salesperson",
//                                 width: "30%",
//                             },
//                             {
//                                 key: "amount",
//                                 label: "Revenue",
//                                 width: "25%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.amount),
//                             },
//                         ]}
//                         rows={data.topQuotations}
//                     />

//                 </div>


//                 <div>

//                     <SectionHeader title="Top Sales Orders" />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "customerName",
//                                 label: "Customer",
//                                 width: "45%",
//                             },
//                             {
//                                 key: "salespersonName",
//                                 label: "Salesperson",
//                                 width: "30%",
//                             },
//                             {
//                                 key: "amount",
//                                 label: "Revenue",
//                                 width: "25%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.amount),
//                             },
//                         ]}
//                         rows={data.topSalesOrders}
//                     />

//                 </div>

//             </div>


//             {/* =================================================
//           ROW 2
//       ================================================= */}

//             <div className="grid grid-cols-2 gap-5 mb-3">

//                 <div>

//                     <SectionHeader
//                         title="Top Countries"
//                         right="Map    Top 10"
//                     />

//                     <CountryMap
//                         data={data.topCountries}
//                     />

//                 </div>


//                 <div>

//                     <SectionHeader
//                         title="Top Products"
//                     />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "productName",
//                                 label: "Product",
//                                 width: "65%",
//                             },
//                             {
//                                 key: "orders",
//                                 label: "Orders",
//                                 width: "15%",
//                                 align: "right",
//                             },
//                             {
//                                 key: "revenue",
//                                 label: "Revenue",
//                                 width: "20%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.revenue),
//                             },
//                         ]}
//                         rows={data.topProducts}
//                     />

//                 </div>

//             </div>


//             {/* =================================================
//           ROW 3
//       ================================================= */}

//             <div className="grid grid-cols-2 gap-5 mb-3">

//                 <div>

//                     <SectionHeader title="Top Customers" />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "customerName",
//                                 label: "Customer",
//                                 width: "60%",
//                             },
//                             {
//                                 key: "orders",
//                                 label: "Orders",
//                                 width: "15%",
//                                 align: "right",
//                             },
//                             {
//                                 key: "revenue",
//                                 label: "Revenue",
//                                 width: "25%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.revenue),
//                             },
//                         ]}
//                         rows={data.topCustomers}
//                     />

//                 </div>


//                 <div>

//                     <SectionHeader
//                         title="Top Categories"
//                         right="Treemap"
//                     />

//                     <CategoryBlock
//                         data={data.topCategories}
//                     />

//                 </div>

//             </div>


//             {/* =================================================
//           ROW 4
//       ================================================= */}

//             <div className="grid grid-cols-2 gap-5 mb-3">

//                 <div>

//                     <SectionHeader title="Top Sales Teams" />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "salesTeamName",
//                                 label: "Sales Team",
//                                 width: "60%",
//                             },
//                             {
//                                 key: "orders",
//                                 label: "Orders",
//                                 width: "15%",
//                                 align: "right",
//                             },
//                             {
//                                 key: "revenue",
//                                 label: "Revenue",
//                                 width: "25%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.revenue),
//                             },
//                         ]}
//                         rows={data.topSalesTeams}
//                     />

//                 </div>


//                 <div>

//                     <SectionHeader title="Top Salespeople" />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "salespersonName",
//                                 label: "Salesperson",
//                                 width: "60%",
//                             },
//                             {
//                                 key: "orders",
//                                 label: "Orders",
//                                 width: "15%",
//                                 align: "right",
//                             },
//                             {
//                                 key: "revenue",
//                                 label: "Revenue",
//                                 width: "25%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.revenue),
//                             },
//                         ]}
//                         rows={data.topSalespeople}
//                     />

//                 </div>

//             </div>


//             {/* =================================================
//           ROW 5
//       ================================================= */}

//             <div className="grid grid-cols-2 gap-5">

//                 <div>

//                     <SectionHeader title="Top Sources" />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "sourceName",
//                                 label: "Source",
//                                 width: "60%",
//                             },
//                             {
//                                 key: "orders",
//                                 label: "Orders",
//                                 width: "15%",
//                                 align: "right",
//                             },
//                             {
//                                 key: "revenue",
//                                 label: "Revenue",
//                                 width: "25%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.revenue),
//                             },
//                         ]}
//                         rows={data.topSources}
//                     />

//                 </div>


//                 <div>

//                     <SectionHeader title="Top Mediums" />

//                     <CompactTable
//                         columns={[
//                             {
//                                 key: "mediumName",
//                                 label: "Medium",
//                                 width: "60%",
//                             },
//                             {
//                                 key: "orders",
//                                 label: "Orders",
//                                 width: "15%",
//                                 align: "right",
//                             },
//                             {
//                                 key: "revenue",
//                                 label: "Revenue",
//                                 width: "25%",
//                                 align: "right",
//                                 render: (row) =>
//                                     currency(row.revenue),
//                             },
//                         ]}
//                         rows={data.topMediums}
//                     />

//                 </div>

//             </div>

//         </div>
//     );
// }


// /* =========================================================
//    TREND ICON
// ========================================================= */

// function TrendingIcon(props) {
//     return (
//         <svg
//             {...props}
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//             strokeLinecap="round"
//             strokeLinejoin="round"
//         >
//             <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
//             <polyline points="16 7 22 7 22 13" />
//         </svg>
//     );
// }



import React from 'react'

export default function Dashboard() {
    return (
        <div>Dashboard</div>
    )
}
