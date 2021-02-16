const { simulateGame } = require('./src/simulate/simulateGame');
const teams = require('./src/data/teams.json');
const players = require('./src/data/players-keep.json');
const { getTeamPower } = require('./src/shared/utils');

const away = teams[0];
const home = teams[1];

away.players = players.filter(p => p.team === away.id);
home.players = players.filter(p => p.team === home.id);

console.log(0);
console.log('MATCHUP PREVIEW');
const awayPower = getTeamPower(away.players);
const homePower = getTeamPower(home.players);
console.log(away.name, away.nickname, ' -> ', awayPower, awayPower / (homePower + awayPower));
console.log(home.name, home.nickname, ' -> ', homePower, homePower / (homePower + awayPower));
console.log(home.venue, home.city, home.state);

simulateGame(away, home);