"use client";
import { useEffect, useState } from "react";
type EmployeeViewRow = Record<string, unknown> & { id: string; status?: unknown; joiningDate?: unknown; name?: unknown; department?: unknown };
type Props = Record<string, any>;
export default function EmployeesPage(props: Props) {
 const { employees, rows, todayAttendance, upcomingEmployees, employeeRows, todayAttendanceByEmployee, query, setQuery, loading, dragId, setDragId, serialSaving, reorderEmployees, changeEmployeeSerial, repairEmployeeIds, copyPhone, money, text, phoneDigits, today, EmployeeStatus, TodayAttendance, openEdit, remove, storage } = props;
 const [detailsEmployee, setDetailsEmployee] = useState<EmployeeViewRow | null>(null);
 useEffect(() => {
   if (!detailsEmployee) return;
   const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setDetailsEmployee(null); };
   window.addEventListener("keydown", onKeyDown);
   return () => window.removeEventListener("keydown", onKeyDown);
 }, [detailsEmployee]);
 const detailLabel = (key: string) => key.replace(/([A-Z])/g, " $1").replace(/^./, c => c.toUpperCase()).replace(/_/g, " ");
 const detailValue = (value: unknown) => {
   if (value === null || value === undefined || value === "") return "Not provided";
   if (typeof value === "boolean") return value ? "Yes" : "No";
   if (typeof value === "object") return JSON.stringify(value, null, 2);
   return String(value);
 };
 return <>
          <div className="employee-summary"><div><b>{employees.length||rows.length}</b><span>Total employees</span></div><div><b>{employees.filter((e: EmployeeViewRow)=>String(e.status||"Active")==="Active"&&String(e.joiningDate||"")<=today()).length}</b><span>Currently working</span></div><div><b>{todayAttendance.filter((r: EmployeeViewRow)=>["Present","Late"].includes(String(r.status))).length}</b><span>Present today</span></div><div><b>{todayAttendance.filter((r: EmployeeViewRow)=>r.status==="Absent").length}</b><span>Absent today</span></div><div><b>{employees.filter((e: EmployeeViewRow)=>String(e.status)==="Inactive").length}</b><span>Inactive</span></div><div><b>{upcomingEmployees.length}</b><span>Future joiners</span></div></div>
          <section className="table-panel employee-panel"><div className="table-toolbar"><div><b>Employee directory</b><span>Drag rows to change serial order · Click mobile to copy · WhatsApp opens chat</span></div><div className="employee-toolbar-actions"><button type="button" className="btn repair-employee-button" onClick={repairEmployeeIds} disabled={serialSaving}>{serialSaving?"Please wait…":"Check & Repair Employee IDs"}</button><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="⌕ Search name, ID, phone, department..."/></div></div>
            {loading?<div className="empty">Loading</div>:<>
              <div className="employee-desktop-table"><div className="table-scroll"><table><thead><tr><th>SERIAL NO.</th><th>MOVE</th><th>EMPLOYEE</th><th>EMPLOYEE ID</th><th>DEPARTMENT / DESIGNATION</th><th>GRADE</th><th>MOBILE</th><th>MONTHLY SALARY</th><th>DAILY RATE</th><th>JOINING DATE</th><th>NOTES</th><th>WORK STATUS</th><th>TODAY'S ATTENDANCE</th><th>ACTIONS</th></tr></thead><tbody>
                {employeeRows.map((row: EmployeeViewRow,index: number)=><tr key={`${row.id}-${index}`} draggable onDragStart={()=>setDragId(row.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>reorderEmployees(row.id)} className={dragId===row.id?"dragging":""}><td><SerialNumberEditor key={`${row.id}-${index}`} employeeId={row.id} employeeName={text(row.name)} serial={index+1} disabled={serialSaving} onSave={changeEmployeeSerial}/></td><td><span className="drag-handle" title="Drag to reorder">⠿</span></td><td><div className="employee-name-cell">{row.photo?<img src={String(row.photo)} alt=""/>:<span className="avatar-fallback">{String(row.name||"E").slice(0,1).toUpperCase()}</span>}<b>{text(row.name)}</b></div></td><td><b className="record-id">{row.id}</b></td><td>{text(row.department)}<small className="cell-subtitle">{text(row.designation)}</small></td><td><span className="grade-pill">{text(row.grade)}</span></td><td><div className="phone-cell"><button className="phone-copy" onClick={()=>copyPhone(row.phone)} title="Click to copy">{text(row.phone)}</button>{Boolean(row.phone)&&<a className="whatsapp-link" href={`https://wa.me/${(phoneDigits(row.phone).startsWith("0")?"880"+phoneDigits(row.phone).slice(1):phoneDigits(row.phone))}`} target="_blank" rel="noreferrer" title="Open WhatsApp">◉</a>}</div></td><td>{money(row.salary)}</td><td>{Number(row.dailyRate)>0?money(row.dailyRate):"Not set"}</td><td>{text(row.joiningDate)}</td><td className="notes-cell">{text(row.notes)}</td><td><EmployeeStatus row={row}/></td><td><TodayAttendance employee={row} records={todayAttendanceByEmployee}/></td><td><div className="actions"><button onClick={()=>setDetailsEmployee(row)}>View full details</button><button onClick={()=>openEdit(row)}>Edit</button><button className="delete" onClick={()=>remove(row)}>Delete</button></div></td></tr>)}
              </tbody></table>{employeeRows.length===0&&<div className="empty">No employees found.</div>}</div></div>
              <div className="employee-mobile-cards">{employeeRows.map((row: EmployeeViewRow,index: number)=><article className="employee-card" key={`${row.id}-${index}`} draggable onDragStart={()=>setDragId(row.id)} onDragOver={e=>e.preventDefault()} onDrop={()=>reorderEmployees(row.id)}><div className="employee-card-head"><label className="serial-number-mobile">Serial <SerialNumberEditor key={`${row.id}-${index}`} employeeId={row.id} employeeName={text(row.name)} serial={index+1} disabled={serialSaving} onSave={changeEmployeeSerial}/></label>{row.photo?<img src={String(row.photo)} alt=""/>:<span className="avatar-fallback">{String(row.name||"E").slice(0,1).toUpperCase()}</span>}<div className="employee-card-title"><b>{text(row.name)}</b><small>{row.id} · {text(row.designation)}</small></div><span className="drag-handle">⠿</span></div><div className="employee-card-grid"><span>Department<b>{text(row.department)}</b></span><span>Grade<b>{text(row.grade)}</b></span><span>Monthly salary<b>{money(row.salary)}</b></span><span>Daily rate<b>{Number(row.dailyRate)>0?money(row.dailyRate):"Not set"}</b></span><span>Today<b><TodayAttendance employee={row} records={todayAttendanceByEmployee}/></b></span><span>Joining date<b>{text(row.joiningDate)}</b></span><span className="employee-notes">Notes<b>{text(row.notes)}</b></span></div><div className="employee-card-foot"><EmployeeStatus row={row}/><div className="phone-cell"><button className="phone-copy" onClick={()=>copyPhone(row.phone)}>{text(row.phone)}</button>{Boolean(row.phone)&&<a className="whatsapp-link" href={`https://wa.me/${(phoneDigits(row.phone).startsWith("0")?"880"+phoneDigits(row.phone).slice(1):phoneDigits(row.phone))}`} target="_blank" rel="noreferrer">◉ WhatsApp</a>}</div></div><div className="employee-card-actions"><button onClick={()=>setDetailsEmployee(row)}>View full details</button><button onClick={()=>openEdit(row)}>Edit</button><button onClick={()=>index>0&&reorderEmployees(employeeRows[index-1].id,row.id)} disabled={index===0}>Move up</button><button className="delete" onClick={()=>remove(row)}>Delete</button></div></article>)}</div>
            </>}
          </section>
          {upcomingEmployees.length>0&&<section className="table-panel upcoming-panel"><div className="section-head"><div><b>Future joining employees</b><span>Employees whose joining date is in the future</span></div><span className="pill">{upcomingEmployees.length} upcoming</span></div><div className="upcoming-list">{upcomingEmployees.map((e: EmployeeViewRow)=><div key={e.id}><b>{text(e.name)}</b><span>{text(e.department)} · Joining {text(e.joiningDate)}</span><EmployeeStatus row={e}/></div>)}</div></section>}
          {detailsEmployee && <div className="overlay employee-details-overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setDetailsEmployee(null);}}>
            <section className="modal employee-details-modal" role="dialog" aria-modal="true" aria-labelledby="employee-details-title">
              <div className="modal-head employee-details-head"><div><h2 id="employee-details-title">Employee full details</h2><p>Complete saved profile information</p></div><button type="button" className="icon-btn employee-details-close" aria-label="Close full details" title="Close" onClick={()=>setDetailsEmployee(null)}>×</button></div>
              <div className="employee-details-profile">
                {detailsEmployee.photo ? <img className="employee-details-photo" src={String(detailsEmployee.photo)} alt={`${text(detailsEmployee.name)} profile`} /> : <span className="employee-details-avatar">{String(detailsEmployee.name||"E").slice(0,1).toUpperCase()}</span>}
                <div><h3>{text(detailsEmployee.name)}</h3><span>{text(detailsEmployee.id)}</span><div><EmployeeStatus row={detailsEmployee}/></div></div>
              </div>
              <div className="employee-details-grid">{Object.entries(detailsEmployee).filter(([key])=>key.toLowerCase()!=="photo" && key.toLowerCase()!=="_id").map(([key,value])=><div className="employee-detail-item" key={key}><span>{detailLabel(key)}</span><b>{detailValue(value)}</b></div>)}</div>
              <div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setDetailsEmployee(null)}>Close</button><button type="button" className="btn primary" onClick={()=>{setDetailsEmployee(null);openEdit(detailsEmployee);}}>Edit employee</button></div>
            </section>
          </div>}
          <div className="data-hint">Storage: <b>{storage.mode==="mongodb"?"MongoDB":"Local JSON fallback"}</b>. Employee changes are saved through the API and mirrored to <code>data/employees.json</code> when possible.</div>
        
 </>;
}


function SerialNumberEditor({employeeId,employeeName,serial,disabled,onSave}:{employeeId:string;employeeName:string;serial:number;disabled:boolean;onSave:(id:string,value:number)=>Promise<void>}) {
 const [value,setValue] = useState(String(serial));
 const [saving,setSaving] = useState(false);
 const [touched,setTouched] = useState(false);
 useEffect(()=>setValue(String(serial)),[serial]);
 async function commit() {
   const parsed=Number(value);
   if(!Number.isInteger(parsed)||parsed<1){setValue(String(serial));setTouched(false);return;}
   if(parsed===serial){setValue(String(serial));setTouched(false);return;}
   if(saving||disabled)return;
   setSaving(true);
   try { await onSave(employeeId,parsed); setTouched(false); }
   finally { setSaving(false); }
 }
 return <span className="serial-editor">
   <input aria-label={`Serial number for ${employeeName}`} className="serial-number-input" type="number" min="1" step="1" disabled={disabled||saving} value={value} onChange={e=>{setValue(e.target.value);setTouched(true);}} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();void commit();}}} />
   <button type="button" className="serial-save-button" disabled={disabled||saving||Number(value)===serial||!Number.isInteger(Number(value))||Number(value)<1} onClick={()=>void commit()}>{saving||disabled?"Saving…":"Save"}</button>
 </span>;
}
