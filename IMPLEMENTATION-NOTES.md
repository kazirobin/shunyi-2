# Implementation notes for this rebuild

This rebuild starts from the supplied Shunyi Garments ERP source archive and preserves its existing employee, attendance, payroll, production, inventory, buyer, supplier, order, quality and shipment modules.

Added in this rebuild:
- Public company landing page at `/`.
- Admin email/password login at `/login`.
- Signed HTTP-only session cookie with server-side signature/expiry verification.
- Middleware protection for management pages and all data APIs.
- Logout controls in the management UI.
- Dashboard canonical URL `/overview`; `/admin` redirects there.
- Work Style and Products module registrations and data resources.
- Removed embedded MongoDB credentials; environment variables are required.
- Password hash helper and `.env.example` setup guide.

Important verification limitation: dependency installation could not complete in this packaging environment, so a fresh `npm run build` could not be run here. Run `npm install` followed by `npm run build` locally before production deployment. The original project used the MongoDB native driver and its existing storage abstraction; this rebuild keeps that working architecture rather than replacing it with Mongoose/NextAuth. Work Style and Products are registered as CRUD modules; advanced product process-entry/assignment workflows and fully dynamic public product detail pages still need further implementation.
