const fs = require('fs');
const content = fs.readFileSync('components/sumatif/PengolahanTab.tsx', 'utf8');

const oldCode = `    } else if (s.formatInput === "deskripsi" && s.nilaiDeskripsi) {
      if (s.nilaiDeskripsi === "BB") nilai = 50;
      else if (s.nilaiDeskripsi === "L") nilai = 70;
      else if (s.nilaiDeskripsi === "C") nilai = 85;
      else if (s.nilaiDeskripsi === "M") nilai = 100;
      else nilai = 75;
    }`;

const newCode = `    } else if (s.formatInput === "deskripsi" && s.nilaiDeskripsi) {
      if (s.nilaiDeskripsi.startsWith("{")) {
        try {
          const vals = JSON.parse(s.nilaiDeskripsi);
          const valArray = Object.values(vals).filter(Boolean);
          if (valArray.length > 0) {
            let total = 0;
            valArray.forEach((v: any) => {
              if (v === "BB") total += 50;
              else if (v === "L") total += 70;
              else if (v === "C") total += 85;
              else if (v === "M") total += 100;
              else total += 75;
            });
            nilai = Math.round(total / valArray.length);
          }
        } catch (e) {
          nilai = 75;
        }
      } else {
        if (s.nilaiDeskripsi === "BB") nilai = 50;
        else if (s.nilaiDeskripsi === "L") nilai = 70;
        else if (s.nilaiDeskripsi === "C") nilai = 85;
        else if (s.nilaiDeskripsi === "M") nilai = 100;
        else nilai = 75;
      }
    }`;

const updated = content.replace(oldCode, newCode);
fs.writeFileSync('components/sumatif/PengolahanTab.tsx', updated);
console.log("Updated PengolahanTab.tsx");
