import type { SocialObjects } from "@/lib/types";

export const SITE = {
  website: "https://utpal.io", // replace this with your deployed domain
  author: "uksarkar",
  desc: "A powerful and flexible role-based access control (RBAC) library for modern JavaScript and TypeScript applications. Supports guards, policies, and advanced async capabilities for granular access control.",
  title: "AccessGate",
  ogImage: "og-image.png",
  repo: "https://github.com/uksarkar/gate-js",
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const menu_items: { title: string; href: string }[] = [
  // {
  //   title: "Home",
  //   href: "/",
  // },
];

// Just works with top-level folders and files. For files, don't add extension as it looks for the slug, and not the file name.
export const side_nav_menu_order: string[] = [
  "why-gate-js",
  "getting-started",
  "core-concepts",
  "api",
  "api/guard",
  "api/policy",
  "api/gate",
  "api/representative",
  "api/decision",
];

// Don't delete anything. You can use 'true' or 'false'.
// These are global settings
export const docconfig = {
  hide_table_of_contents: false,
  hide_breadcrumbs: false,
  hide_side_navigations: false,
  hide_datetime: false,
  hide_time: true,
  hide_search: false,
  hide_repo_button: false,
  hide_author: true,
};

// Set your social. It will appear in footer. Don't change the `name` value.
export const Socials: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/uksarkar/",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/utpal-sarkar/",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Twitter",
    href: "https://twitter.com/uksarkarr/",
    linkTitle: `${SITE.title} on Twitter`,
    active: true,
  },
  {
    name: "Reddit",
    href: "https://github.com/uksarkar/",
    linkTitle: `${SITE.title} on Reddit`,
    active: false,
  },
];
