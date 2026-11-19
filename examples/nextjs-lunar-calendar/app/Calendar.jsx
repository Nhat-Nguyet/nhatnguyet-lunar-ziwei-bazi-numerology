"use client";
import { useEffect, useState } from "react";
import { dayInfo, isoDate, monthGrid, nextTet } from "../lib/calendar.js";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function Calendar() {
  // "Today" is the viewer's date, so it is read in the browser, not at build time.
  const [today, setToday] = useState(null);
  const [view, setView] = useState(null);
  useEffect(() => {
    const now = new Date();
    setToday(isoDate(now));
    setView({ year: now.getFullYear(), month: now.getMonth() + 1 });
  }, []);
  if (!today || !view) return <p className="muted">Loading today's date…</p>;

  const info = dayInfo(today);
  const tet = nextTet(today);
  const move = (step) => {
    const m = view.month + step;
    setView({ year: view.year + Math.floor((m - 1) / 12), month: ((m + 11) % 12) + 1 });
  };

  return (
    <>
      <section className="today">
        <p className="big">
          Lunar {info.day}/{info.month}{info.leap ? " (leap)" : ""}/{info.year}
        </p>
        <p>
          Day <b>{info.dayName}</b> · month <b>{info.monthName}</b> · year <b>{info.yearName}</b> ({info.zodiac})
        </p>
        <p>Solar term: {info.solarTerm}</p>
        <p>
          {tet.days === 0 ? "Happy Tết! " : `Tết ${tet.year.yearName}: ${tet.days} days to go (${tet.date})`}
        </p>
      </section>

      <section>
        <div className="nav">
          <button onClick={() => move(-1)} aria-label="Previous month">‹</button>
          <h2>{MONTHS[view.month - 1]} {view.year}</h2>
          <button onClick={() => move(1)} aria-label="Next month">›</button>
        </div>
        <table className="grid">
          <thead>
            <tr>{WEEKDAYS.map((d) => <th key={d}>{d}</th>)}</tr>
          </thead>
          <tbody>
            {monthGrid(view.year, view.month).map((week, i) => (
              <tr key={i}>
                {week.map((c, j) =>
                  c ? (
                    <td key={j} className={c.date === today ? "is-today" : undefined}>
                      <span className="solar">{c.day}</span>
                      <span className="lunar">
                        {c.lunarDay === 1 ? `${c.lunarDay}/${c.lunarMonth}${c.leap ? "L" : ""}` : c.lunarDay}
                      </span>
                      {c.term && <span className="term">{c.term}</span>}
                    </td>
                  ) : (
                    <td key={j} />
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
