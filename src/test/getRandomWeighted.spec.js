const { getRandomWeighted } = require('../shared/utils');

const arr = new Array(20).fill('x').map((x, i) => i);
const results = {};

for (let i = 0; i < 1000; i++) {
  const x = getRandomWeighted(arr);
  results[x] = (results[x] || 0) + 1;
}

console.log(results);