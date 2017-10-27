#!/bin/bash

babel index.js --out-file dist/uav-router.js

uglifyjs dist/uav-router.js --compress --mangle --output dist/uav-router.min.js

# npm run test -- --single-run --browsers=ChromeHeadless
