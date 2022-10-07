const { simulateGame } = require('./src/simulate/simulateGame');
const teams = require('./src/data/teams.json');
const players = require('./src/data/players.json');
const { POSITIONS } = require('./src/shared/constants');
const {
  getTeamPlayers,
  getTeamPower,
  defenderRating,
  goalieRating,
  passerRating,
  playmakerRating,
  scoreRating,
} = require('./src/shared/utils');

const positionEvaluator = {
  [POSITIONS.STRIKER]: (p) => (scoreRating(p) + playmakerRating(p)) / 2,
  [POSITIONS.SWEEPER]: (p) => (playmakerRating(p) + passerRating(p)) / 2,
  [POSITIONS.CHAD]: (p) => (playmakerRating(p) + defenderRating(p)) / 2,
  [POSITIONS.DEFENDER]: defenderRating,
  [POSITIONS.GOALKEEPER]: goalieRating,
}

const awayIndex = Math.floor(Math.random() * teams.length);
const away = teams[awayIndex];
const otherTeams = teams.filter(t => t.id !== away.id && t.divId === away.divId);
const homeIndex = Math.floor(Math.random() * otherTeams.length);
const home = otherTeams[homeIndex];

away.players = getTeamPlayers(away, players);
home.players = getTeamPlayers(home, players);

console.log('MATCHUP PREVIEW');
console.log('----------------------------');
const awayPower = getTeamPower(away.players);
const homePower = getTeamPower(home.players);
console.log(away.name, away.nickname, `(${away.divId})`, ' -> ', awayPower, awayPower / (homePower + awayPower));
console.log(home.name, home.nickname, `(${home.divId})`, ' -> ', homePower, homePower / (homePower + awayPower));
console.log(`${home.venue} - ${home.city}, ${home.state}`);

const { awayScore, homeScore, overtime, events } = simulateGame(away, home, () => {});

const playerEventMap = events.reduce((prev, ev) => {
  const key = ev.player || '<empty>';
  if (!prev[key]) prev[key] = [];
  prev[key].push(ev);
  return prev;
}, {});

const roadUpset = homePower - awayPower > 12 && awayScore > homeScore;
const homeUpset = awayPower - homePower > 8 && homeScore > awayScore;
console.log(`${away.abbr} ${awayScore}, ${home.abbr} ${homeScore}${overtime ? ' (OT)' : ''}${homeUpset ? ' [UPSET]' : ''}${roadUpset ? ' [ROAD UPSET]' : ''}`);
console.log('-------------------------------------------------------');

const logPlayerEvents = player => {
  const eventList = playerEventMap[player.id] || [];
  const eventBreakdown = eventList.reduce((prev, { key }) => ({
    ...prev,
    [key]: (prev[key] || 0) + 1,
  }), {});
  console.log('#', player.number, player.first, player.last, '-', player.position, `[${positionEvaluator[player.position](player)}]`);
  if (Object.keys(eventBreakdown).length === 0) {
    console.log('\tNO STATS');
  } else {
    for(eventType in eventBreakdown) {
      console.log('\t', eventType, 'x', eventBreakdown[eventType]);
    }
  }
  console.log('');
};

const showTeamStats = (team) => {
  console.log('\n', team.name,'TEAM STATS\n----------------------------------------------------');
  const teamEventBreakdown = team.players.reduce((agg, player) => {{
    const eventList = playerEventMap[player.id] || [];
    return eventList.reduce((prev, { key }) => ({
      ...prev,
      [key]: (prev[key] || 0) + 1,
    }), agg);
  }}, {});
  Object.keys(teamEventBreakdown).sort().forEach(eventType => {
    console.log('\t', eventType, 'x', teamEventBreakdown[eventType]);
  });
};

showTeamStats(away);
showTeamStats(home);

console.log('\n', away.name,'\n----------------------------------------------------');
away.players.forEach(logPlayerEvents);
console.log('\n', home.name,'\n----------------------------------------------------');
home.players.forEach(logPlayerEvents);