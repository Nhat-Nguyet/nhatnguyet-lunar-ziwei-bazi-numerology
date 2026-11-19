import Calendar from "./Calendar";
import ZiWeiForm from "./ZiWeiForm";

export default function Page() {
  return (
    <main>
      <h1>Vietnamese lunar calendar</h1>
      <Calendar />
      <ZiWeiForm />
      <footer>
        Data: <a href="https://nhatnguyet.org">Nhat Nguyet</a> (nhatnguyet.org), computed in your browser.
      </footer>
    </main>
  );
}
