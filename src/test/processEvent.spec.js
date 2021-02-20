const { processEvent } = require('../simulate/simulateGame');
const teams = require('../data/teams.json');
const players = require('../data/players-keep.json');
const { POSITIONS } = require('../shared/constants');
const { getTeamPlayers, goalieRating } = require('../shared/utils');

const away = teams[62];
const home = teams[15];

away.players = getTeamPlayers(away, players);
home.players = getTeamPlayers(home, players);

console.log(0);

const sortBy = f => (a, b) => f(b) - f(a);
away.goalie = away.players
  .filter(p => p.position === POSITIONS.GOALKEEPER)
  .sort(sortBy(goalieRating))[Math.random() > 0.9 ? 1 : 0];
home.goalie = home.players
  .filter(p => p.position === POSITIONS.GOALKEEPER)
  .sort(sortBy(goalieRating))[Math.random() > 0.9 ? 1 : 0];

const simGame = (start = {}) => {
  const result = {...start };
  for (let i = 0; i < 120; i++) {
    const [e = {}, n] = processEvent.contest(away, home);
    const key = e.log;
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}

let total = {};
const COUNT = 10000;
for (let i = 0; i < COUNT; i++) {
  total = simGame(total);
}

Object.entries(total).sort(([a], [b]) => a.localeCompare(b)).forEach(([key, value]) => {
  console.log(key, value / COUNT);
});