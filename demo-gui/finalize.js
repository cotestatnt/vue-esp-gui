// Finalize Nodejs Script
// 1 - Append JS in HTML Document
// 2 - Gzip HTML
// 3 - Covert to Raw Bytes
// 4 - ( Save to File: webpage.h ) in dist Folder

const fs = require('fs');
const { gzip } = require('@gfx/zopfli');

let js = fs.readFileSync(__dirname+'/dist/js/app.js');
let html = `
<!DOCTYPE html>
<html lang="">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <link rel="icon" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZmlsbD0iIzIxOTZGMyIgZD0iTTIuMjUgMTMuNTYzQzEuMDYyIDEyLjI3LjEyMiAxMC41OTMgMCA4LjM0NHYtLjY1NmMuMDQ4LS45NS4yOS0xLjgxMS41OTQtMi41OTRDLjk4NyA0LjA3OSAxLjU5NSAzLjEwOCAyLjMxMyAyLjVjMCAuNDg2LjAxMi45NS4wNjIgMS4yNS4xNTIuOTEyLjY2IDEuOTEgMS4yODIgMi41MzEuNTAzLjUwNCAxLjE3OC44NSAxLjg3NSAxLjIxOSAxLjM5LjczOCAyLjcxMiAxLjM4OSA0LjA5NCAyLjEyNS44ODkuNDc0IDEuODA0IDEuMDU5IDIuMDYyIDIgLjM2NiAxLjMzLS40MSAyLjU2NC0xLjAzMSAzLjIxOUEzLjgzNCAzLjgzNCAwIDAgMSA4LjQzOCAxNkg3LjM3NWMtMi4xOTQtLjI0NS0zLjkzMi0xLjE0LTUuMTI1LTIuNDM3em01LjI4MS04LjAzMWMxLjI4MS42NzEgMi42MDQgMS4zNTMgMy45MDcgMi4wMzEuNjcxLjM1IDEuMjgyLjcxMSAxLjc1IDEuMjE5Ljg1Mi45MjQgMS4zODQgMi4xMjggMS4yODEgMy44NzUuMjExLS4yMDQuNDAyLS40ODkuNTYyLS43ODEuNDY1LS44NS44NDEtMS45MzMuOTM4LTMuMTg4LS4wMDUtLjAzNy4wMDYtLjA1Ni4wMzEtLjA2M3YtMS4yNUMxNS40NSAyLjk3OSAxMi40NTguMzM5IDguMjUgMGgtLjQwNkM3LjAyMi4xMzggNi4yMi4zNzMgNS43NS45MDdjLS4zMy4zNzQtLjU5IDEuMDQtLjYyNSAxLjQ2OC0uMTQ4IDEuODM5IDEuMTcgMi41MDggMi40MDYgMy4xNTd6Ii8+PC9zdmc+">
    <title>ESP GPIO List</title>
  </head>  
  <body>
    <noscript>
      <strong>Sorry, but this page doesn't work without JavaScript. Please enable to continue.</strong>
    </noscript>
    <div id="app"></div>
    <script>${js}</script>
  </body>
</html>
`;
// Gzip the index.html file with JS Code.
// const gzippedIndex = zlib.gzipSync(html, {'level': zlib.constants.Z_BEST_COMPRESSION});
// let indexHTML = getByteArray(gzippedIndex);

// let source =
// `
// const uint32_t WEBPAGE_HTML_SIZE = ${indexHTML.length};
// const char WEBPAGE_HTML[] PROGMEM = { ${indexHTML} };
// `;
// fs.writeFileSync(__dirname+'/dist/webpage.h', source, 'utf8');

// Produce a second variant with zopfli (a improved zip algorithm by google)
// Takes much more time and maybe is not available on every machine
const input =  html;
gzip(input, {numiterations: 15}, (err, output) => {
    let indexHTML = output;
    let source =
`
const uint32_t WEBPAGE_HTML_SIZE = ${indexHTML.length};
const char WEBPAGE_HTML[] PROGMEM = { ${indexHTML} };
`;

  fs.writeFileSync('webpage.h', source, 'utf8');

});
