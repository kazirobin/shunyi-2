import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"attendance", title:"Attendance", singular:"Attendance record", icon:"◷", fields:[
    {key:"employee",label:"Employee",type:"text",required:true},{key:"date",label:"Date",type:"date",required:true},
    {key:"checkIn",label:"Check in",type:"text"},{key:"checkOut",label:"Check out",type:"text"},
    {key:"status",label:"Status",type:"select",options:["Present","Half Day","Absent","Leave"]},{key:"overtimeHours",label:"Overtime hours",type:"number"},{key:"dailyRate",label:"Daily rate snapshot (৳)",type:"number"},{key:"monthlySalary",label:"Monthly salary snapshot (৳)",type:"number"},{key:"attendanceUnits",label:"Attendance units",type:"number"},{key:"wageAmount",label:"Wage amount (৳)",type:"number"}
  ]};
