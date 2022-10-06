const { simulateGame } = require('./src/simulate/simulateGame');
const teams = require('./src/data/teams.json');
const players = require('./src/data/players-keep.json');
const { getTeamPower, getTeamPlayers } = require('./src/shared/utils');

const awayIndex = Math.floor(Math.random() * teams.length);
const away = teams[awayIndex];
const otherTeams = teams.filter(t => t.id !== away.id && t.divId === away.divId);
const homeIndex = Math.floor(Math.random() * otherTeams.length);
const home = otherTeams[homeIndex];

away.players = getTeamPlayers(away, players);
home.players = getTeamPlayers(home, players);

console.log(0);
console.log('MATCHUP PREVIEW');
const awayPower = getTeamPower(away.players);
const homePower = getTeamPower(home.players);
console.log(away.name, away.nickname, `(${away.divId})`, ' -> ', awayPower, awayPower / (homePower + awayPower));
console.log(home.name, home.nickname, `(${home.divId})`, ' -> ', homePower, homePower / (homePower + awayPower));
console.log(`${home.venue} - ${home.city}, ${home.state}`);

const COUNT = 10000;
const wins = [0, 0];

for (let i = 0; i < COUNT; i++) {
  const { awayScore, homeScore } = simulateGame(away, home, () => {});
  if (awayScore > homeScore) {
    wins[0]++;
  } else {
    wins[1]++;
  }
}

console.log(wins.map(x => x / COUNT));