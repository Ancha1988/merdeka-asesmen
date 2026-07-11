const fs = require('fs');
let content = fs.readFileSync('components/sumatif/InputNilaiTab.tsx', 'utf8');

const theadMatch = `{availableKktp.map(k => {
                if (k.jenis === "deskripsi" && k.indikator && k.indikator.length > 0) {
                  return k.indikator.map((ind, i) => (
                    <th key={\`\${k.kktpId}-\${ind.indikatorId}\`} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[250px]">
                      <div className="truncate text-[11px] text-slate-500 mb-1" title={k.nama}>{k.nama}</div>
                      <div className="line-clamp-2 text-sm text-blue-700 leading-tight" title={ind.deskripsi}>{i+1}. {ind.deskripsi}</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-1 capitalize bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                        Indikator KKTP
                      </div>
                    </th>
                  ));
                }
                return (
                  <th key={k.kktpId} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[200px]">
                    <div className="truncate" title={k.nama}>{k.nama}</div>
                    <div className="text-xs font-normal text-slate-500 mt-1 capitalize bg-slate-100 p-1 rounded inline-block">
                      {k.jenis} • {k.bobot}%
                    </div>
                  </th>
                )
              })}`;

const theadReplace = `{availableKktp.map(k => {
                if (k.jenis === "deskripsi" && k.indikator && k.indikator.length > 0) {
                  return k.indikator.map((ind, i) => (
                    <th key={\`\${k.kktpId}-\${ind.indikatorId}\`} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[250px]">
                      <div className="truncate text-[11px] text-slate-500 mb-1" title={k.nama}>{k.nama}</div>
                      <div className="line-clamp-2 text-sm text-blue-700 leading-tight" title={ind.deskripsi}>{i+1}. {ind.deskripsi}</div>
                      <div className="text-[10px] font-normal text-slate-400 mt-1 capitalize bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                        Indikator KKTP
                      </div>
                    </th>
                  ));
                }
                
                if (k.jenis === "rubrik" && k.rubrik) {
                  const rInd = Array.from(new Set(k.rubrik.map(r => r.indikator).filter(Boolean))) as string[];
                  if (rInd.length > 0) {
                    return rInd.map((indName, i) => (
                      <th key={\`\${k.kktpId}-\${indName}\`} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[250px]">
                        <div className="truncate text-[11px] text-slate-500 mb-1" title={k.nama}>{k.nama}</div>
                        <div className="line-clamp-2 text-sm text-blue-700 leading-tight" title={indName}>{i+1}. {indName}</div>
                        <div className="text-[10px] font-normal text-slate-400 mt-1 capitalize bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                          Indikator Rubrik
                        </div>
                      </th>
                    ));
                  }
                }
                
                return (
                  <th key={k.kktpId} className="px-4 py-3 font-semibold border-r border-slate-200 min-w-[150px] max-w-[200px]">
                    <div className="truncate" title={k.nama}>{k.nama}</div>
                    <div className="text-xs font-normal text-slate-500 mt-1 capitalize bg-slate-100 p-1 rounded inline-block">
                      {k.jenis} • {k.bobot}%
                    </div>
                  </th>
                )
              })}`;
              
content = content.replace(theadMatch, theadReplace);

const tbodyMatch = `{availableKktp.map(k => {
                  if (k.jenis === "deskripsi" && k.indikator && k.indikator.length > 0) {
                    return k.indikator.map(ind => (
                      <td key={\`\${k.kktpId}-\${ind.indikatorId}\`} className="px-2 py-2 border-r border-slate-200 align-top">
                        {renderIndicatorInput(m.muridId, k, ind)}
                      </td>
                    ))
                  }
                  return (
                    <td key={k.kktpId} className="px-2 py-2 border-r border-slate-200 align-top">
                      {renderInput(m.muridId, k)}
                    </td>
                  )
                })}`;
                
const tbodyReplace = `{availableKktp.map(k => {
                  if (k.jenis === "deskripsi" && k.indikator && k.indikator.length > 0) {
                    return k.indikator.map(ind => (
                      <td key={\`\${k.kktpId}-\${ind.indikatorId}\`} className="px-2 py-2 border-r border-slate-200 align-top">
                        {renderIndicatorInput(m.muridId, k, ind)}
                      </td>
                    ))
                  }
                  
                  if (k.jenis === "rubrik" && k.rubrik) {
                    const rInd = Array.from(new Set(k.rubrik.map(r => r.indikator).filter(Boolean))) as string[];
                    if (rInd.length > 0) {
                      return rInd.map((indName) => (
                        <td key={\`\${k.kktpId}-\${indName}\`} className="px-2 py-2 border-r border-slate-200 align-top">
                          {renderRubrikIndicatorInput(m.muridId, k, indName)}
                        </td>
                      ));
                    }
                  }
                  
                  return (
                    <td key={k.kktpId} className="px-2 py-2 border-r border-slate-200 align-top">
                      {renderInput(m.muridId, k)}
                    </td>
                  )
                })}`;
                
content = content.replace(tbodyMatch, tbodyReplace);

const renderInd = `  const renderIndicatorInput = (mId: string, k: Kktp, ind: any) => {`;
const addRenderRubrik = `  const renderRubrikIndicatorInput = (mId: string, k: Kktp, indName: string) => {
    const defaultVal = localData[mId]?.[k.kktpId] ?? "";
    let vals: Record<string, string> = {};
    try {
      vals = (defaultVal && typeof defaultVal === "string" && defaultVal.startsWith("{")) ? JSON.parse(defaultVal) : {};
    } catch(e) {}
    
    const selectedVal = vals[indName] || "";
    const options = k.rubrik?.filter(r => r.indikator === indName) || [];

    return (
      <select
        value={selectedVal}
        onChange={(e) => {
          const newVals = { ...vals, [indName]: e.target.value };
          handleCellChange(mId, k.kktpId, JSON.stringify(newVals));
        }}
        className={\`w-full px-2 py-2 border rounded focus:outline-none text-sm \${
          selectedVal !== "" ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'border-slate-200'
        }\`}
      >
        <option value="">-</option>
        {options.map(r => (
          <option key={r.tingkatan} value={r.tingkatan}>{r.tingkatan} ({r.label})</option>
        ))}
      </select>
    );
  };

  const renderIndicatorInput = (mId: string, k: Kktp, ind: any) => {`;
  
content = content.replace(renderInd, addRenderRubrik);

fs.writeFileSync('components/sumatif/InputNilaiTab.tsx', content);
console.log("Updated InputNilaiTab.tsx");
