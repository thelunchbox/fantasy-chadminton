const { simulateGame } = require('./simulateGame');
const teams = require('../data/teams.json');
const players = require('../data/players.json');
const schedule = require('../data/schedule.json');
const { getTeamPower, getTeamPlayers, getTeamByField } = require('../shared/utils');

const CURRENT_WEEK = 0; // later this should be dynamic

const week = schedule[CURRENT_WEEK];

week.forEach(([a, h]) => {
  const away = getTeamByField(teams, 'abbr', a);
  const home = getTeamByField(teams, 'abbr', h);
  away.players = getTeamPlayers(away, players);
  home.players = getTeamPlayers(home, players);
  
  const awayPower = getTeamPower(away.players);
  const homePower = getTeamPower(home.players);
  console.log(away.name, away.nickname, `(${away.divId})`, Math.round(awayPower));
  console.log(home.name, home.nickname, `(${home.divId})`, Math.round(homePower));
  console.log(`${home.venue || 'Memorial Park'} - ${home.city}, ${home.state}`);
  
  const { awayScore, homeScore, overtime } = simulateGame(away, home, () => {});
  const roadUpset = homePower - awayPower > 12 && awayScore > homeScore;
  const homeUpset = awayPower - homePower > 8 && homeScore > awayScore;
  
  console.log(`${away.abbr} ${awayScore}, ${home.abbr} ${homeScore}${overtime ? ' (OT)' : ''}${homeUpset ? ' [UPSET]' : ''}${roadUpset ? ' [ROAD UPSET]' : ''}`);
  console.log('----------------------------');
});
