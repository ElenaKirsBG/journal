# Собирает index.html (для хостинга/iPhone) и preview.html (для предпросмотра) из src/body.html
from pathlib import Path
root = Path(__file__).parent
body = (root / 'src/body.html').read_text(encoding='utf-8')
head = '''<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Журнал">
<meta name="theme-color" content="#eef1f4" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0c1218" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" href="icons/icon-192.png">
<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
'''
(root / 'index.html').write_text(head + body + '\n</body>\n</html>\n', encoding='utf-8')
(root / 'preview.html').write_text(body, encoding='utf-8')
print('ok')
