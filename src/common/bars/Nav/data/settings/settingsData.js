// import {
//   Building2,
//   Palette,
//   Bot,
//   ChartPie,
//   Users,
//   ShieldCheck,
//   Receipt,
//   Landmark,
//   BadgePercent,
//   MonitorSmartphone,
//   SlidersHorizontal,
//   CreditCard,
//   Package,
//   UserRound,
//   FileText,
//   FileCheck,
//   Wallet,
//   Truck,
//   ClipboardList,
//   CircleDollarSign,
//   Calculator,
//   ScrollText,
//   Boxes,
//   Bell,
//   Mail,
//   Globe,
//   Lock,
//   Database,
// } from "lucide-react";

// export const settings = [
//   {
//     title: "Organization",
//     items: [
//       {
//         label: "Organization Profile",
//         icon: Building2,
//         path: "/companies",
//       },
//       {
//         label: "Bank Account",
//         icon: Bot,
//         path: "/bankAccount",
//       },
//       {
//         label: "Users",
//         icon: Users,
//         path: "/users",
//       },
//       {
//         label: "Roles",
//         icon: ShieldCheck,
//         path: "/roles",
//       },

//       {
//         label: "MenuPermission",
//         icon: ShieldCheck,
//         path: "/menupermission",
//       },
//     ],
//   },

//   {
//     title: "Taxes",
//     items: [
//       {
//         label: "Taxes",
//         icon: Receipt,
//         path: "/taxes",
//       },
//     ],
//   },

//   {
//     title: "Inventory",
//     items: [
//       {
//         label: "Items",
//         icon: Package,
//         path: "/items",
//       },
//       {
//         label: "Category",
//         icon: Boxes,
//         path: "/categories",
//       },

//       {
//         label: "Sub Category",
//         icon: Boxes,
//         path: "/subCategoires",
//       },

//       {
//         label: "Sizes",
//         icon: Boxes,
//         path: "/sizes",
//       },

//       {
//         label: "Units",
//         icon: Boxes,
//         path: "/units",
//       },
//     ],
//   },

//   // {
//   //   title: "Preferences",
//   //   items: [
//   //     {
//   //       label: "MSME Settings",
//   //       icon: MonitorSmartphone,
//   //       path: "/settings/msme",
//   //     },
//   //     {
//   //       label: "Customer Portal",
//   //       icon: Globe,
//   //       path: "/settings/customer-portal",
//   //     },
//   //     {
//   //       label: "General Preferences",
//   //       icon: SlidersHorizontal,
//   //       path: "/settings/preferences",
//   //     },
//   //     {
//   //       label: "Payment Terms",
//   //       icon: CreditCard,
//   //       path: "/settings/payment-terms",
//   //     },
//   //     {
//   //       label: "Notifications",
//   //       icon: Bell,
//   //       path: "/settings/notifications",
//   //     },
//   //     {
//   //       label: "Email Templates",
//   //       icon: Mail,
//   //       path: "/settings/email",
//   //     },
//   //     {
//   //       label: "Security",
//   //       icon: Lock,
//   //       path: "/settings/security",
//   //     },
//   //     {
//   //       label: "Backup & Restore",
//   //       icon: Database,
//   //       path: "/settings/backup",
//   //     },
//   //   ],
//   // },

//   // {
//   //   title: "Sales",
//   //   items: [
//   //     {
//   //       label: "Customers",
//   //       icon: UserRound,
//   //       path: "/customers",
//   //     },
//   //     {
//   //       label: "Quotes",
//   //       icon: FileText,
//   //       path: "/quotes",
//   //     },
//   //     {
//   //       label: "Invoices",
//   //       icon: FileCheck,
//   //       path: "/invoices",
//   //     },
//   //     {
//   //       label: "Payments Received",
//   //       icon: Wallet,
//   //       path: "/payments",
//   //     },
//   //     {
//   //       label: "Delivery Notes",
//   //       icon: Truck,
//   //       path: "/delivery-notes",
//   //     },
//   //     {
//   //       label: "Packing Slips",
//   //       icon: ClipboardList,
//   //       path: "/packing-slips",
//   //     },
//   //   ],
//   // },

//   // {
//   //   title: "Purchases",
//   //   items: [
//   //     {
//   //       label: "Expenses",
//   //       icon: CircleDollarSign,
//   //       path: "/expenses",
//   //     },
//   //     {
//   //       label: "Bills",
//   //       icon: ScrollText,
//   //       path: "/bills",
//   //     },
//   //     {
//   //       label: "Vendors",
//   //       icon: Users,
//   //       path: "/vendors",
//   //     },
//   //   ],
//   // },

//   // {
//   //   title: "Accounting",
//   //   items: [
//   //     {
//   //       label: "Chart of Accounts",
//   //       icon: Calculator,
//   //       path: "/accounts",
//   //     },
//   //   ],
//   // },
// ];

/* =========================================================
   SETTINGS DATA  (single source of truth)

   group: "organization" -> Organization Settings panel / sidebar group
   group: "module"       -> Module Settings panel / sidebar group

   To add a new module later, add ONE object with group: "module".
   It automatically appears in the dashboard, the sidebar and the routes.
========================================================= */
import CompanyOverViewDashboard from "../../../../../module/company/overviewCard/CompanyOverViewDashboard";
import ComingSoon from "./ComingSoon";
// import BrandingPage from "../pages/BrandingPage";
// import InvoiceSettings from "../pages/InvoiceSettings";

/* Temporary page for items you have not built yet */
// const ComingSoon = () => (
//   <div className="p-8 text-sm text-gray-500">This page is coming soon.</div>
// );

export const settings = [
  /* ---------------- ORGANIZATION SETTINGS ---------------- */
  {
    title: "Organization",
    group: "organization",
    items: [
      {
        label: "Profile",
        path: "/companies",
        component: CompanyOverViewDashboard,
      },
      {
        label: "Branding",
        path: "/companies/View",
        component: ComingSoon,
      },
      {
        label: "Custom Domain",
        path: "/settings/organization/custom-domain",
        component: ComingSoon,
      },
      {
        label: "Locations",
        path: "/settings/organization/locations",
        component: ComingSoon,
      },
      {
        label: "AI Integration",
        path: "/settings/organization/ai-integration",
        component: ComingSoon,
      },
      {
        label: "Manage Subscription",
        path: "/settings/organization/subscription",
        component: ComingSoon,
      },
    ],
  },
  {
    title: "Users & Roles",
    group: "organization",
    items: [
      { label: "Users", path: "/users", component: ComingSoon },
      { label: "Roles", path: "/roles", component: ComingSoon },
      {
        label: "Menu Permission",
        path: "/menuPermission",
        component: ComingSoon,
      },
    ],
  },
  {
    title: "Taxes & Compliance",
    group: "organization",
    items: [
      { label: "Taxes", path: "/settings/taxes", component: ComingSoon },
      {
        label: "Direct Taxes",
        path: "/settings/direct-taxes",
        component: ComingSoon,
      },
      { label: "MSME Settings", path: "/settings/msme", component: ComingSoon },
    ],
  },

  //products
  {
    title: "Products",
    group: "organization",
    items: [
      { label: "Products", path: "/items", component: ComingSoon },
      { label: "Categories", path: "/categories", component: ComingSoon },
      { label: "SubCategories", path: "/subCategoires", component: ComingSoon },
      { label: "Sizes", path: "/sizes", component: ComingSoon },
      { label: "Units", path: "/units", component: ComingSoon },
    ],
  },
  {
    title: "Setup & Configurations",
    group: "organization",
    items: [
      {
        label: "General",
        path: "/settings/setup/general",
        component: ComingSoon,
      },
      {
        label: "Currencies",
        path: "/settings/setup/currencies",
        component: ComingSoon,
      },
      {
        label: "Payment Terms",
        path: "/settings/setup/payment-terms",
        component: ComingSoon,
      },
      {
        label: "Opening Balances",
        path: "/settings/setup/opening-balances",
        component: ComingSoon,
      },
      {
        label: "Reminders",
        path: "/settings/setup/reminders",
        component: ComingSoon,
      },
      {
        label: "Customer Portal",
        path: "/settings/setup/customer-portal",
        component: ComingSoon,
      },
      {
        label: "Vendor Portal",
        path: "/settings/setup/vendor-portal",
        component: ComingSoon,
      },
    ],
  },
  // {
  //   title: "Customization",
  //   group: "organization",
  //   items: [
  //     {
  //       label: "Transaction Number Series",
  //       path: "/settings/customization/number-series",
  //       component: ComingSoon,
  //     },
  //     {
  //       label: "PDF Templates",
  //       path: "/settings/customization/pdf-templates",
  //       component: ComingSoon,
  //     },
  //     {
  //       label: "Email Notifications",
  //       path: "/settings/customization/email",
  //       component: ComingSoon,
  //     },
  //     {
  //       label: "SMS Notifications",
  //       path: "/settings/customization/sms",
  //       component: ComingSoon,
  //     },
  //     {
  //       label: "Reporting Tags",
  //       path: "/settings/customization/reporting-tags",
  //       component: ComingSoon,
  //     },
  //     {
  //       label: "Web Tabs",
  //       path: "/settings/customization/web-tabs",
  //       component: ComingSoon,
  //     },
  //     {
  //       label: "Digital Signature",
  //       path: "/settings/customization/digital-signature",
  //       component: ComingSoon,
  //     },
  //   ],
  // },
  {
    title: "Automation",
    group: "organization",
    items: [
      {
        label: "Workflow Rules",
        path: "/settings/automation/rules",
        component: ComingSoon,
      },
      {
        label: "Workflow Actions",
        path: "/settings/automation/actions",
        component: ComingSoon,
      },
      {
        label: "Workflow Logs",
        path: "/settings/automation/logs",
        component: ComingSoon,
      },
      {
        label: "Schedules",
        path: "/settings/automation/schedules",
        component: ComingSoon,
      },
    ],
  },

  /* ---------------- MODULE SETTINGS ---------------- */
  {
    title: "General",
    group: "module",
    items: [
      {
        label: "Preferences",
        path: "/settings/modules/general/preferences",
        component: ComingSoon,
      },
    ],
  },
  {
    title: "Online Payments",
    group: "module",
    items: [
      {
        label: "Payment Gateways",
        path: "/settings/modules/payments/gateways",
        component: ComingSoon,
      },
    ],
  },
];

/* Flat list of every item, used to generate routes */
export const settingsItems = settings.flatMap((section) => section.items);
