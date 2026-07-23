from pathlib import Path

root = Path(r"c:\Users\NAIRARNAV\Documents\GitHub\oaktonenable.github.io")
files = [root / "index.html", root / "styles.css", root / "script.js", root / "isowrite-model.html"]

replacements = [
    ("â€”", "—"),
    ("â€“", "–"),
    ("â€º", "›"),
    ("â€˜", "‘"),
    ("â€™", "’"),
    ("â€œ", "“"),
    ("â€", "”"),
    ("â€¦", "…"),
    ("â¤", "❤"),
    ("â–²", "▲"),
    ("â—Ž", "◆"),
    ("â—", "◐"),
    ("â•", "═"),
    ("â†’", "→"),
    ("â±ï¸", "⏱️"),
    ("âš™ï¸", "⚙️"),
    ("â–ˆ", "█"),
    ("â”€", "─"),
    ("ðŸŽ“", "📅"),
    ("ðŸ“¢", "📸"),
    ("ðŸ“„", "📐"),
    ("ðŸ“Š", "📈"),
    ("ðŸ’¥", "💡"),
    ("ðŸ’©", "❤"),
    ("ðŸ“‚", "💻"),
    ("ðŸ“€", "🖨️"),
    ("ðŸ“Œ", "📊"),
    ("ðŸ“·", "🛠️"),
    ("ðŸ§ ", "🧠"),
    ("ðŸŒ±", "🌱"),
    ("ðŸ“ˆ", "📊"),
    ("ðŸŽ›ï¸", "📈"),
    ("ðŸ–Šï¸", "🧭"),
    ("ðŸ—£ï¸", "🤝"),
    ("ðŸ’»", "💻"),
    ("ðŸ–¨ï¸", "🧰"),
    ("ðŸ“…", "🕒"),
    ("ðŸ“", "📍"),
    ("ðŸ› ï¸", "🧪"),
    ("ðŸ“¬", "✉️"),
    ("ðŸ“¸", "📷"),
    ("ðŸ“", "🗂️"),
    ("Â·", "·"),
    ("Â©", "©"),
    ("Â", ""),
]

for path in files:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    original = text
    for bad, good in replacements:
        text = text.replace(bad, good)
    if text != original:
        path.write_text(text, encoding="utf-8")
        print(f"updated {path.name}")
    else:
        print(f"no changes {path.name}")
