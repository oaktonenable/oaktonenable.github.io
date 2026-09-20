$root = 'c:\Users\NAIRARNAV\Documents\GitHub\oaktonenable.github.io'
$files = @('index.html','styles.css','script.js','isowrite-model.html')
$replacements = @(
  @('â€”','—'),
  @('â€“','–'),
  @('â€º','›'),
  @('â€˜','‘'),
  @('â€™','’'),
  @('â€œ','“'),
  @('â€','”'),
  @('â€¦','…'),
  @('â¤','❤'),
  @('â–²','▲'),
  @('â—Ž','◎'),
  @('â—','◐'),
  @('â•','═'),
  @('â†’','→'),
  @('â±ï¸','⏱️'),
  @('âš™ï¸','⚙️'),
  @('â–ˆ','█'),
  @('â”€','─'),
  @('ðŸŽ“','📅'),
  @('ðŸ“¢','📸'),
  @('ðŸ“„','📐'),
  @('ðŸ“Š','📈'),
  @('ðŸ’¥','💡'),
  @('ðŸ’©','❤'),
  @('ðŸ“‚','💻'),
  @('ðŸ“€','🖨️'),
  @('ðŸ“Œ','📊'),
  @('ðŸ“·','🛠️'),
  @('Â·','·'),
  @('Â©','©'),
  @('Â','')
)
foreach ($file in $files) {
  $path = Join-Path $root $file
  if (Test-Path $path) {
    $text = Get-Content $path -Raw -Encoding UTF8
    foreach ($pair in $replacements) {
      $text = $text.Replace($pair[0], $pair[1])
    }
    Set-Content -Path $path -Value $text -Encoding UTF8
  }
}
