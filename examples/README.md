# Examples

Three ways to try the Nhat Nguyet libraries, from no install at all to a script.
The same birth data (1990-09-19, 20:00, male) gives the same chart everywhere.

| Folder | Run | What it shows |
|---|---|---|
| [`cdn.html`](cdn.html) | open the file in a browser | a Zi Wei chart drawn from `https://cdn.jsdelivr.net/npm/@nhatnguyet/tu-vi/+esm`, no build step |
| [`node/`](node) | `cd node && npm install && npm start` | lunar date in Vietnam and China, Zi Wei, BaZi, numerology; writes three SVG files |
| [`python/`](python) | `pip install nhatnguyet && python python/example.py` | the same as `node/`, in pure Python |

Expected output of `node/` and `python/`:

```text
1985-01-21  Vietnam: 1985-1-1  China: 1984-12-1
Zi Wei: Earth Five, Life palace in Hợi: Moon
BaZi: Canh Ngọ | Ất Dậu | Đinh Hợi | Canh Tuất
Numerology: life path 11, expression 3
```

The examples use the English API (`castZiWei`, `cast_zi_wei`...), which needs
version 0.2.0 or newer of the npm packages and of `nhatnguyet` on PyPI.

## In the browser, on nhatnguyet.org

- Live playground: <https://nhatnguyet.org/en/ma-nguon-mo/thu> (runs these
  packages in your browser; nothing is sent to a server)
- API reference: <https://nhatnguyet.org/en/ma-nguon-mo/tai-lieu>

## StackBlitz

Open `node/` in StackBlitz:
<https://stackblitz.com/github/Nhat-Nguyet/nhatnguyet/tree/main/examples/node>

StackBlitz can only open a public GitHub repository, so this link starts
working once the repository is public.

---

**Tiếng Việt.** Ba cách thử thư viện: `cdn.html` mở thẳng bằng trình duyệt (nạp
gói từ jsDelivr), `node/` và `python/` là ví dụ chạy được, in ngày âm Việt Nam
và Trung Quốc, lá số Tử Vi, Bát Tự, Thần số học và ghi ba tệp SVG. Trang thử
trực tiếp: <https://nhatnguyet.org/ma-nguon-mo/thu>, tài liệu API:
<https://nhatnguyet.org/ma-nguon-mo/tai-lieu>. Liên kết StackBlitz chỉ chạy khi
repo đã công khai.

Data: Nhat Nguyet (nhatnguyet.org)
