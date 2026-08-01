#!/bin/sh
# Regenerate static/pforex.min.js. Requires node; pulls terser on demand.
set -e
npx --yes terser@5 static/pforex.js -c -m --comments false -o /tmp/pforex.min.js
printf %s "/*! pforex 0.4 | https://github.com/japherwocky/pforex */
" > static/pforex.min.js
cat /tmp/pforex.min.js >> static/pforex.min.js
echo "wrote static/pforex.min.js ($(wc -c < static/pforex.min.js) bytes)"
