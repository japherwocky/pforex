#!/bin/sh
# Regenerate static/pforex.min.js. Requires node; pulls terser on demand.
set -e
npx --yes terser@5 static/pforex.js -c -m --comments false -o /tmp/pforex.min.js
# Read the version out of the source rather than hardcoding it here, which is
# exactly how the banner drifted from '0.4' to the real version last time.
version=$(grep -o "version: '[^']*'" static/pforex.js | head -1 | sed "s/version: '//;s/'//")
printf '%s' "/*! pforex $version | https://github.com/japherwocky/pforex */
" > static/pforex.min.js
cat /tmp/pforex.min.js >> static/pforex.min.js
echo "wrote static/pforex.min.js ($(wc -c < static/pforex.min.js) bytes)"
