import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"payroll", title:"Payroll", singular:"Payroll record", icon:"৳", fields:[
    {key:"employee",label:"Employee",type:"text",required:true},{key:"month",label:"Month",type:"text",required:true},
    {key:"basicSalary",label:"Basic salary",type:"number"},{key:"overtime",label:"Overtime amount",type:"number"},
    {key:"deduction",label:"Deduction",type:"number"},{key:"netSalary",label:"Net salary",type:"number"},
    {key:"paymentStatus",label:"Payment status",type:"select",options:["Pending","Paid"]}
  ]};
