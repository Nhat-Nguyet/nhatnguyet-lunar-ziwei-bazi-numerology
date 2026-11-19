// Run: npm install && npm start
// Writes chart.svg, bazi.svg and numerology.svg next to this file.
import { writeFileSync } from "node:fs";
import { toLunar } from "@nhatnguyet/am-lich";
import { castZiWei, ziWeiSvg } from "@nhatnguyet/tu-vi";
import { castBaZi, baZiSvg } from "@nhatnguyet/bat-tu";
import { numerology, numerologySvg } from "@nhatnguyet/than-so-hoc";

const birth = { date: "1990-09-19", time: "20:00", gender: "male" };

// Lunar calendar: the same day can differ between Vietnam (UTC+7) and China (UTC+8).
const vn = toLunar("1985-01-21");
const cn = toLunar("1985-01-21", { country: "CN" });
console.log(`1985-01-21  Vietnam: ${vn.year}-${vn.month}-${vn.day}  China: ${cn.year}-${cn.month}-${cn.day}`);

const chart = castZiWei({ ...birth, name: "Nguyen Van An" });
const life = chart.palaces[chart.lifePalace];
console.log(`Zi Wei: ${chart.bureau.name}, Life palace in ${life.branch}: ${life.stars.filter((s) => s.kind === "major").map((s) => s.name).join(", ")}`);
writeFileSync(new URL("./chart.svg", import.meta.url), ziWeiSvg(chart));

const bz = castBaZi(birth);
console.log(`BaZi: ${["year", "month", "day", "hour"].map((p) => bz.pillars[p]?.label).join(" | ")}`);
writeFileSync(new URL("./bazi.svg", import.meta.url), baZiSvg(bz, { name: "Nguyen Van An" }));

const n = numerology({ name: "Nguyen Van An", birthDate: birth.date, today: "2026-11-19" });
console.log(`Numerology: life path ${n.lifePath}, expression ${n.expression}`);
writeFileSync(new URL("./numerology.svg", import.meta.url), numerologySvg(n));
