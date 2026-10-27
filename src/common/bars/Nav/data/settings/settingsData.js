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
        path: "/bankAccount",
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
  {
    title: "Invoice Customization",
    group: "organization",
    items: [
      {
        label: "Sales Persons",
        path: "/salesPersons",
        component: ComingSoon,
      },
      {
        label: "Currencies",
        path: "/currencies",
        component: ComingSoon,
      },

      {
        label: "EmailSignatures",
        path: "/emailSignatures",
        component: ComingSoon,
      },

      {
        label: "Party",
        path: "/parties",
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
