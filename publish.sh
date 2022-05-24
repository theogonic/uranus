set -e
npm run build
npm version patch
cd dist/uranus && npm publish