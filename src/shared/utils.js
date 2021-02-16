const { POSITIONS } = require('../shared/constants');

function getTeamPower(players) {
  return players.reduce((agg, p) => {
    return agg + p.attributes.reduce((sum, attr) => sum + attr, 0);
  }, 0)
}

function getRandomItem(array, { distribution } = {}) {
  let arr = array;
  if (!Array.isArray(array)) {
    arr = Object.values(array);
  }
  let index = Math.floor(Math.random() * arr.length);
  if (distribution) {
    const sum = distribution.reduce((a, b) => a + b, 0);
    const breakpoints = distribution.map(a => a / sum).reduce((map, value) => [
      ...map,
      value + (map[map.length - 1] || 0),
    ], []);
    const r = Math.random();
    for (index = 0; breakpoints[index] < r; index++);
  }
  return arr[index];
}

function getRandomWeighted(array) {
  const len = array.length;
  const i = Math.floor(Math.sqrt(Math.random() * (len * len)));
  return array[i];
}

const goalOpportunityScore = {
  [POSITIONS.STRIKER]: 5,
  [POSITIONS.SWEEPER]: 4,
  [POSITIONS.DEFENDER]: 3,
  [POSITIONS.CHAD]: 2,
  [POSITIONS.GOALKEEPER]: 1,
};

function scoreRating(p) {
  const [speed, quick, shot, power, tough, stamina, heart] = p.attributes;
  return (
    shot +
    (quick / 2) +
    (stamina / 2) +
    (heart / 3) +
    (Math.random() * goalOpportunityScore[p.position])
  );
}

function scoreSort(p1, p2) {
  return scoreRating(p2) - scoreRating(p1);
}

module.exports = {
  getRandomItem,
  getRandomWeighted,
  getTeamPower,
  scoreSort,
};