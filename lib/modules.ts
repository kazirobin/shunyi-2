import type { ModuleConfig } from "@/features/types";
export type { ModuleConfig } from "@/features/types";
import { config as employees } from "@/features/employees/config";
import { config as attendance } from "@/features/attendance/config";
import { config as payroll } from "@/features/payroll/config";
import { config as departments } from "@/features/departments/config";
import { config as buyers } from "@/features/buyers/config";
import { config as suppliers } from "@/features/suppliers/config";
import { config as orders } from "@/features/orders/config";
import { config as production } from "@/features/production/config";
import { config as inventory } from "@/features/inventory/config";
import { config as quality_control } from "@/features/quality-control/config";
import { config as shipments } from "@/features/shipments/config";
import { config as settings } from "@/features/settings/config";
import { config as workStyle } from "@/features/work-style/config";
import { config as products } from "@/features/products/config";

/** Single page registry. Add/remove a feature by importing/unregistering its config here. */
export const modules: ModuleConfig[] = [employees, attendance, payroll, departments, buyers, suppliers, orders, production, inventory, quality_control, shipments, settings, workStyle, products];
export function getModule(key: string) { return modules.find((module) => module.key === key && module.enabled !== false); }
