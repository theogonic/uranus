set -e
cd projects/uranus && npm version patch && cd ../..
npm run build
cd dist/uranus && npm publish