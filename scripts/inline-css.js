const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'assets', 'css', 'style.css');
const htmlPath = path.join(__dirname, '..', 'index.html');

const css = fs.readFileSync(cssPath, 'utf8');
let html = fs.readFileSync(htmlPath, 'utf8');

const target = '<link rel="stylesheet" href="./assets/css/style.css">';
const replacement = `<link rel="stylesheet" href="./assets/css/style.css">

  <!-- ==========================================================================
       Inlined Luxury Stylesheet (Guarantees Instant 100% Styling on Vercel & Offline)
       ========================================================================== -->
  <style id="aerciousCoreStyles">
${css}
  </style>`;

if (html.includes(target)) {
  html = html.replace(target, replacement);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Successfully inlined CSS into index.html! New length:', html.length);
} else {
  console.log('Target link tag not found or already inlined.');
}
