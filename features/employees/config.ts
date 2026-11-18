import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"employees", title:"Employees", singular:"Employee", icon:"♙", fields:[
    {key:"name",label:"Full name",type:"text",required:true},{key:"photo",label:"Employee photo (ImgBB URL)",type:"image"},{key:"phone",label:"Mobile number",type:"tel"},{key:"email",label:"Email",type:"email"},{key:"gender",label:"Gender",type:"select",options:["Male","Female","Other"]},{key:"bloodGroup",label:"Blood group",type:"select",options:["A+","A-","B+","B-","AB+","AB-","O+","O-"]},{key:"nid",label:"NID / ID number",type:"text"},{key:"address",label:"Address",type:"text"},
    {key:"department",label:"Department",type:"select",options:["Administration","Cutting","Sewing","Finishing","Quality","Store","Maintenance","Merchandising"]},
    {key:"designation",label:"Designation",type:"text"},{key:"grade",label:"Employee grade",type:"select",options:["Grade A","Grade B","Grade C","Grade D","Trainee"]},{key:"salary",label:"Monthly salary (৳)",type:"number"},{key:"dailyRate",label:"Daily attendance rate (৳)",type:"number"},
    {key:"joiningDate",label:"Joining date",type:"date"},{key:"employmentType",label:"Employment type",type:"select",options:["Permanent","Contract","Temporary","Probation","Trainee"]},{key:"status",label:"Employment status",type:"select",options:["Active","Inactive","On leave"]},{key:"notes",label:"Notes",type:"textarea"}
  ]};
