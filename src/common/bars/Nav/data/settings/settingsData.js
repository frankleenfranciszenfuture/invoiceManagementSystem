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
        label: "Company Profile",
        path: "/settings/companies",
        component: CompanyOverViewDashboard,
      },
      // {
      //   label: "Branding",
      //   path: "/companies/View",
      //   component: ComingSoon,
      // },
      {
        label: "Bank Account",
        path: "/settings/bankAccount",
        component: ComingSoon,
      },
    ],
  },
  {
    title: "Users & Roles",
    group: "organization",
    items: [
      { label: "Users", path: "/settings/users", component: ComingSoon },
      { label: "Roles", path: "/settings/roles", component: ComingSoon },
      {
        label: "Menu Permission",
        path: "/settings/menuPermission",
        component: ComingSoon,
      },
    ],
  },
  {
    title: "Taxes & Compliance",
    group: "organization",
    items: [
      { label: "Taxes", path: "/settings/taxes", component: ComingSoon },
      // {
      //   label: "Direct Taxes",
      //   path: "/settings/direct-taxes",
      //   component: ComingSoon,
      // },
      // { label: "MSME Settings", path: "/settings/msme", component: ComingSoon },
    ],
  },

  //products
  {
    title: "Products",
    group: "organization",
    items: [
      { label: "Products", path: "/invoice/items", component: ComingSoon },
      {
        label: "Categories",
        path: "/settings/categories",
        component: ComingSoon,
      },
      {
        label: "SubCategories",
        path: "/settings/subCategoires",
        component: ComingSoon,
      },
      { label: "Sizes", path: "/settings/sizes", component: ComingSoon },
      { label: "Units", path: "/settings/units", component: ComingSoon },
    ],
  },

  {
    title: "Invoice Customization",
    group: "organization",
    items: [
      {
        label: "Sales Persons",
        path: "/settings/salesPersons",
        component: ComingSoon,
      },
      {
        label: "Currencies",
        path: "/settings/currencies",
        component: ComingSoon,
      },

      {
        label: "EmailSignatures",
        path: "/settings/emailSignatures",
        component: ComingSoon,
      },
    ],
  },
  {
    title: "Inventory Customization",
    group: "organization",
    items: [
      {
        label: "Open Stock",
        path: "/settings/openStock",
        component: ComingSoon,
      },
      {
        label: "Adjustment Stock",
        path: "/settings/adjustmentStock",
        component: ComingSoon,
      },
      {
        label: "Parties",
        path: "/settings/parties",
        component: ComingSoon,
      },
      {
        label: "Outstanding Clearances",
        path: "/settings/parties/clearances",
        component: ComingSoon,
      },
      {
        label: "Warehouse",
        path: "/settings/warehouse",
        component: ComingSoon,
      },
      {
        label: "Reminders",
        path: "/settings",
        component: ComingSoon,
      },
    ],
  },
  /* ---------------- MODULE SETTINGS ---------------- */
  // {
  //   title: "General",
  //   group: "module",
  //   items: [
  //     {
  //       label: "Preferences",
  //       path: "/settings/modules/general/preferences",
  //       component: ComingSoon,
  //     },
  //   ],
  // },
  // {
  //   title: "Online Payments",
  //   group: "module",
  //   items: [
  //     {
  //       label: "Payment Gateways",
  //       path: "/settings/modules/payments/gateways",
  //       component: ComingSoon,
  //     },
  //   ],
  // },
];

/* Flat list of every item, used to generate routes */
export const settingsItems = settings.flatMap((section) => section.items);
