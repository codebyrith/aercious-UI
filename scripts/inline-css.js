const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'assets', 'css', 'style.css');
const htmlPath = path.join(__dirname, '..', 'index.html');

const css = fs.readFileSync(cssPath, 'utf8');
let html = fs.readFileSync(htmlPath, 'utf8');

const styleBlockRegex = /<!-- =+[\s\S]*?Inlined Luxury Stylesheet[\s\S]*?-->\s*<style id="aerciousCoreStyles">[\s\S]*?<\/style>/;
const replacementBlock = `<!-- ==========================================================================
       Inlined Luxury Stylesheet (Guarantees Instant 100% Styling on Vercel & Offline)
       ========================================================================== -->
  <style id="aerciousCoreStyles">
${css}
  </style>`;

if (styleBlockRegex.test(html)) {
  html = html.replace(styleBlockRegex, replacementBlock);
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log('Successfully refreshed existing inlined CSS in index.html! File length:', html.length);
} else {
  const target = '<link rel="stylesheet" href="./assets/css/style.css">';
  if (html.includes(target)) {
    html = html.replace(target, `${target}\n\n  ${replacementBlock}`);
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('Successfully inserted inlined CSS into index.html! File length:', html.length);
  } else {
    console.warn('Could not find link tag or style block to update.');
  }
}
