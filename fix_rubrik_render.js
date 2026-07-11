const fs = require('fs');
let content = fs.readFileSync('components/sumatif/InputNilaiTab.tsx', 'utf8');

const match = `    if (k.jenis === "rubrik") {
      return (
        <select
          value={defaultVal}
          onChange={(e) => handleCellChange(mId, k.kktpId, e.target.value)}
          className={\`w-full px-2 py-2 border rounded focus:outline-none text-sm \${
            defaultVal !== "" ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'border-slate-200'
          }\`}
        >
          <option value="">-</option>
          {k.rubrik?.map(r => (
            <option key={r.tingkatan} value={r.tingkatan}>{r.tingkatan} ({r.label})</option>
          ))}
        </select>
      );
    }`;

const replace = `    if (k.jenis === "rubrik") {
      const options = k.rubrik?.filter(r => !r.indikator) || k.rubrik || [];
      return (
        <select
          value={defaultVal}
          onChange={(e) => handleCellChange(mId, k.kktpId, e.target.value)}
          className={\`w-full px-2 py-2 border rounded focus:outline-none text-sm \${
            defaultVal !== "" ? 'bg-green-50 border-green-200 text-green-700 font-medium' : 'border-slate-200'
          }\`}
        >
          <option value="">-</option>
          {options.map(r => (
            <option key={r.tingkatan} value={r.tingkatan}>{r.tingkatan} ({r.label})</option>
          ))}
        </select>
      );
    }`;
    
content = content.replace(match, replace);
fs.writeFileSync('components/sumatif/InputNilaiTab.tsx', content);
console.log("Updated renderInput for rubrik in InputNilaiTab.tsx");
