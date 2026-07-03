// Users collection — controls who can log into the Payload admin panel at /admin
// auth: true means Payload handles login for this collection (email + password)
// Only you (the admin) will have an account here initially.
import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  // auth: true turns this collection into an authentication system.
  // Payload will automatically add email, password, and session fields.
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
      label: "Full Name",
    },
  ],
};
