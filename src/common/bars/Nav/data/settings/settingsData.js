import {
  Building2,
  Palette,
  Bot,
  ChartPie,
  Users,
  ShieldCheck,
  Receipt,
  Landmark,
  BadgePercent,
  MonitorSmartphone,
  SlidersHorizontal,
  CreditCard,
  Package,
  UserRound,
  FileText,
  FileCheck,
  Wallet,
  Truck,
  ClipboardList,
  CircleDollarSign,
  Calculator,
  ScrollText,
  Boxes,
  Bell,
  Mail,
  Globe,
  Lock,
  Database,
} from "lucide-react";

export const settings = [
  {
    title: "Organization",
    items: [
      {
        label: "Organization Profile",
        icon: Building2,
        path: "/settings/organization",
      },
      {
        label: "Branding",
        icon: Palette,
        path: "/settings/branding",
      },
      {
        label: "AI Integration",
        icon: Bot,
        path: "/settings/ai",
      },
      {
        label: "Usage Stats",
        icon: ChartPie,
        path: "/settings/usage",
      },
      {
        label: "Users",
        icon: Users,
        path: "/users",
      },
      {
        label: "Roles",
        icon: ShieldCheck,
        path: "/roles",
      },
    ],
  },

  {
    title: "Taxes",
    items: [
      {
        label: "Taxes",
        icon: Receipt,
        path: "/settings/taxes",
      },
      {
        label: "Direct Taxes",
        icon: Landmark,
        path: "/settings/direct-taxes",
      },
      {
        label: "GST Settings",
        icon: BadgePercent,
        path: "/settings/gst",
      },
    ],
  },

  {
    title: "Preferences",
    items: [
      {
        label: "MSME Settings",
        icon: MonitorSmartphone,
        path: "/settings/msme",
      },
      {
        label: "Customer Portal",
        icon: Globe,
        path: "/settings/customer-portal",
      },
      {
        label: "General Preferences",
        icon: SlidersHorizontal,
        path: "/settings/preferences",
      },
      {
        label: "Payment Terms",
        icon: CreditCard,
        path: "/settings/payment-terms",
      },
      {
        label: "Notifications",
        icon: Bell,
        path: "/settings/notifications",
      },
      {
        label: "Email Templates",
        icon: Mail,
        path: "/settings/email",
      },
      {
        label: "Security",
        icon: Lock,
        path: "/settings/security",
      },
      {
        label: "Backup & Restore",
        icon: Database,
        path: "/settings/backup",
      },
    ],
  },

  {
    title: "Sales",
    items: [
      {
        label: "Customers",
        icon: UserRound,
        path: "/customers",
      },
      {
        label: "Quotes",
        icon: FileText,
        path: "/quotes",
      },
      {
        label: "Invoices",
        icon: FileCheck,
        path: "/invoices",
      },
      {
        label: "Payments Received",
        icon: Wallet,
        path: "/payments",
      },
      {
        label: "Delivery Notes",
        icon: Truck,
        path: "/delivery-notes",
      },
      {
        label: "Packing Slips",
        icon: ClipboardList,
        path: "/packing-slips",
      },
    ],
  },

  {
    title: "Purchases",
    items: [
      {
        label: "Expenses",
        icon: CircleDollarSign,
        path: "/expenses",
      },
      {
        label: "Bills",
        icon: ScrollText,
        path: "/bills",
      },
      {
        label: "Vendors",
        icon: Users,
        path: "/vendors",
      },
    ],
  },

  {
    title: "Inventory",
    items: [
      {
        label: "Items",
        icon: Package,
        path: "/items",
      },
      {
        label: "Stock",
        icon: Boxes,
        path: "/stock",
      },
    ],
  },

  {
    title: "Accounting",
    items: [
      {
        label: "Chart of Accounts",
        icon: Calculator,
        path: "/accounts",
      },
    ],
  },
];
