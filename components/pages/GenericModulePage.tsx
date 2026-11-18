"use client";
type ModuleFieldView = { key: string; label: string; type?: string };
type ModuleRecordView = Record<string, unknown> & { id: string };
type Props = Record<string, any>;
export default function GenericModulePage(props: Props) {
 const { config, rows, query, setQuery, loading, filtered, text, money, openEdit, remove } = props;
 return <>
          <div className="table-panel"><div className="table-toolbar"><div><b>{config.title} directory</b><span>{rows.length} total records</span></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="⌕ Search records..."/></div>{loading?<div className="empty">Loading</div>:<div className="table-scroll"><table><thead><tr><th>RECORD ID</th>{config.fields.map((f: ModuleFieldView)=><th key={f.key}>{f.label.toUpperCase()}</th>)}<th>ACTIONS</th></tr></thead><tbody>{filtered.map((row: ModuleRecordView)=><tr key={row.id}><td><b className="record-id">{row.id}</b></td>{config.fields.map((f: ModuleFieldView)=><td key={f.key} className={f.type==="textarea"?"notes-cell":""}>{f.type==="image"?(row[f.key]?<img className="employee-thumb" src={String(row[f.key])} alt=""/>:"No photo"):f.key.toLowerCase().includes("salary")||f.key.toLowerCase().includes("price")?money(row[f.key]):text(row[f.key])}</td>)}<td><div className="actions"><button onClick={()=>openEdit(row)}>Edit</button><button className="delete" onClick={()=>remove(row)}>Delete</button></div></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty">No records found.</div>}</div>}</div>
        
 </>;
}
