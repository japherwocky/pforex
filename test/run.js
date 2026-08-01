/*
 * Headless runner for test/index.html.
 *
 * The suite itself lives in that page and is perfectly readable in a browser
 * -- this only exists so it also runs without a human opening a URL. It
 * serves the repo root, loads the page in Chromium, and reads the results
 * the page already parks on window.__pforex_results.
 *
 * Runs twice: once against static/pforex.js and once against the minified
 * build, which is how a stale or broken pforex.min.js gets caught.
 *
 *     node test/run.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
};

function serve() {
    const server = http.createServer((req, res) => {
        // Strip the query string; the suite uses ?min=1 and cache busters.
        const rel = decodeURIComponent(req.url.split('?')[0]);
        const file = path.join(ROOT, rel === '/' ? '/test/index.html' : rel);

        // Refuse to serve outside the repo, since this binds a real port.
        if (!file.startsWith(ROOT)) {
            res.writeHead(403).end('forbidden');
            return;
        }

        fs.readFile(file, (err, body) => {
            if (err) {
                res.writeHead(404).end('not found');
                return;
            }
            res.writeHead(200, {
                'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
                // Otherwise the second run can be served a cached first run.
                'Cache-Control': 'no-store',
            });
            res.end(body);
        });
    });

    return new Promise((resolve) => {
        // Port 0: let the OS pick, so this never collides with a dev server.
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}

async function runSuite(browser, url, label) {
    const page = await browser.newPage();
    const consoleErrors = [];

    page.on('pageerror', (err) => consoleErrors.push(String(err)));
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    await page.goto(url);

    // report() runs behind a setTimeout, because the MutationObserver
    // assertion has to wait a tick for the observer to fire.
    await page.waitForFunction(() => window.__pforex_results, null, { timeout: 10000 });
    const results = await page.evaluate(() => window.__pforex_results);

    console.log('\n' + label);

    results.results.forEach((r) => {
        if (!r.ok) {
            console.log('  FAIL  ' + r.name);
            console.log('        got    ' + JSON.stringify(r.actual));
            console.log('        wanted ' + JSON.stringify(r.expected));
        }
    });

    consoleErrors.forEach((e) => console.log('  ERROR ' + e));

    const ok = results.failed === 0 && consoleErrors.length === 0;
    console.log('  ' + (ok ? 'ok' : 'FAILED') + ' -- ' +
        (results.total - results.failed) + '/' + results.total + ' assertions' +
        (consoleErrors.length ? ', ' + consoleErrors.length + ' console errors' : ''));

    await page.close();
    return ok;
}

async function main() {
    let chromium;

    try {
        ({ chromium } = require('playwright'));
    } catch (e) {
        console.error('playwright is not installed. Run `npm install` first.');
        process.exit(2);
    }

    const server = await serve();
    const base = 'http://127.0.0.1:' + server.address().port + '/test/index.html';
    const browser = await chromium.launch();

    let ok = true;

    try {
        ok = await runSuite(browser, base, 'static/pforex.js') && ok;
        ok = await runSuite(browser, base + '?min=1', 'static/pforex.min.js') && ok;
    } finally {
        await browser.close();
        server.close();
    }

    console.log('');
    process.exit(ok ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
