# Employee ID and Serial Repair

This update adds a one-time repair action to the Employees page.

## Before starting
1. Back up your MongoDB database (or export the app JSON backup).
2. Keep your existing `.env` file. The project archive intentionally does not include `.env` or database credentials.
3. Replace the project source files with this archive, without deleting your `.env`.

## Run
```bash
npm ci
npm run build
npm run dev
```

Open `/employees`. If duplicate IDs are present, click **Repair duplicate IDs** and confirm the operation. The repair:
- keeps every employee row; it does not delete or merge employees;
- keeps `EMP-1001` with Rahim Uddin when that duplicate group is present;
- keeps the first stored `EMP-1002` record as the legacy ID and gives the other duplicate a new ID;
- changes attendance/payroll employee references only when the old ID and employee name identify exactly one duplicate row;
- leaves ambiguous same-name historical references attached to the original ID;
- stores a MongoDB backup in `__employee_identity_repair_backup` before changing records;
- normalizes employee sort order to unique consecutive positions.

After repair, change serials in the Employees page and click Save. Employee IDs are independent from serial numbers.
