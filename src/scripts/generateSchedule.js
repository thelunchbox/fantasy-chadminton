const teams = require('../data/teams.json');
const divisions = require('../data/divisions.json');
const { SCHEDULE_PLACEHOLDER } = require('../shared/constants');
const { CURRENT_SEASON } = require('../data/settings.json');
const { getTeamByField } = require('../shared/utils');
const fs = require('fs');
const path = require('path');

const rotateArraysWithPivot = (a, b) => {
  // the first team in the top row stays as a pivot, so we take the second (index 1)
  const demote = a.splice(1, 1)[0];
  // then we take the last team from the bottom row
  const promote = b.pop();
  // team from the top goes to the beginning of the bottom
  b.unshift(demote);
  // team from the bottom goes to the end of the top
  a.push(promote);
};

const getDivisionScheduleMatrix = (teams, cycles = 1) => {
  const odd = teams % 2 != 0;
  const divisionSize = !odd ? teams : teams + 1;
  const topRow = [];
  const bottomRow = [];
  // build 
  for (let i = 0; i < divisionSize / 2; i+=1) {
    topRow.push(i);
    let other = (divisionSize - 1) - i;
    if (odd && i === 0) other = SCHEDULE_PLACEHOLDER;
    bottomRow.push(other);
  }
  const schedule = [];
  const weeks = (divisionSize - 1) * cycles;
  for (let w = 0; w < weeks; w+=1) {
    const week = [];
    let away, home;
    if (w % 2 === 0) {
      away = topRow;
      home = bottomRow;
    } else {
      away = bottomRow;
      home = topRow;
    }
    for (let g = 0; g < home.length; g+=1) {
      week.push([away[g], home[g]]);
    }
    schedule.push(week);
    rotateArraysWithPivot(topRow, bottomRow);
  }

  return schedule;
};

const getSisterDivisionScheduleMatrix = (teams) => {
  const topRow = [];
  const bottomRow = [];
  for (let i = 0; i < teams; i+=1) {
    topRow.push(i);
    bottomRow.push(i);
  }
  const schedule = [];
  const weeks = teams;
  for (let w = 0; w < weeks; w+=1) {
    const week = [];
    for (let g = 0; g < topRow.length; g+=1) {
      week.push([topRow[g], bottomRow[g]]);
    }
    schedule.push(week);
    bottomRow.push(bottomRow.shift());
  }

  return schedule;
};

const getTeamSchedule = (schedule, team) => {
  const teamSchedule = schedule.map(w => {
    const game = w.find(g => g.includes(team));
    if (game[0] === team) return `at ${game[1]}`;
    return `vs ${game[0]}`; 
  });
  return [teamSchedule, teamSchedule.filter(g => g.startsWith('vs')).length];
}

const getDivisionParings = () => {
  const tops = [];
  const bots = [];
  divisions.forEach(({id, sister}) => {
    if (!bots.includes(id)) {
      tops.push(id);
      bots.push(sister);
    }
  });
  return [tops, bots];
};

const teamsByDivision = teams.sort(() => Math.random() - 0.5).reduce((agg, team) => {
  const { divId } = team;
  if (!agg[divId]) {
    agg[divId] = [];
  }
  agg[divId].push(team);
  return agg;
}, {});

const teamsPerDivision = teamsByDivision['1'].length;
const divisionMatrix = getDivisionScheduleMatrix(teamsPerDivision, 2);
const crossDivMatrix = getSisterDivisionScheduleMatrix(teamsPerDivision);
const [divTops, divBots] = getDivisionParings();

let schedule = [];

for (d in teamsByDivision) {
  const division = teamsByDivision[d];
  for (let w = 0; w < divisionMatrix.length; w+=1) {
    const games = divisionMatrix[w];
    const week = games.map(([a, h]) => {
      if (a === SCHEDULE_PLACEHOLDER)
        return [a, division[h].abbr];
      if (h === SCHEDULE_PLACEHOLDER)
        return [division[a].abbr, h];
      return [division[a].abbr, division[h].abbr];
    });
    if (!schedule[w]) schedule[w] = [];
    schedule[w] = [...schedule[w], ...week];
  }
}

const crossDivSchedule = [];

// if we have an odd number of teams, the first one of these will be taken care of (and we play them twice because... we just do)
const start = teamsPerDivision % 2 === 1 ? 1 : 0;
for (i in divTops) {
  const division1 = teamsByDivision[divTops[i]];
  const division2 = teamsByDivision[divBots[i]];
  for (let w = start; w < crossDivMatrix.length; w += 1) {
    const games = crossDivMatrix[w];
    const week = games.map(([a, h]) => {
      const t1 = division1[a];
      const t2 = division2[h];
      const game = [t1.abbr, t2.abbr];
      if (w % 2 === 0) {
        game.reverse();
      }
      return game;
    });
    if (!crossDivSchedule[w]) crossDivSchedule[w] = [];
    crossDivSchedule[w] = [...crossDivSchedule[w], ...week];
  }
}
// if the first element is empty, we just toss it out
if (!crossDivSchedule[0]) crossDivSchedule.shift();

schedule = schedule.map((week, index) => {
  const byeTeams = week.filter(game => game.includes(SCHEDULE_PLACEHOLDER)).map(([away, home]) => {
    const isHome = away === SCHEDULE_PLACEHOLDER;
    const team = getTeamByField(teams, 'abbr', isHome ? home : away);
    team.isHome = isHome;
    return team;
  });
    const games = [];
    while (byeTeams.length > 0) {
      const t1 = byeTeams.shift();
      let otherDiv = divBots[divTops.indexOf(t1.divId)];
      if (!otherDiv) otherDiv = divTops[divBots.indexOf(t1.divId)];
      const t2 = byeTeams.find(t => t.divId === otherDiv);
      if (!t2) {
        console.error(week, t1.abbr, t1.divId, byeTeams.map(({ abbr, divId }) => ({ abbr, divId })), otherDiv);
      }
      const teamIndex = byeTeams.indexOf(t2);
      byeTeams.splice(teamIndex, 1);
      const game = [t1.abbr, t2.abbr];
      if (index % 2 === 0) game.reverse();
      games.push(game);
    }
    return [
      ...week.filter(game => !game.includes(SCHEDULE_PLACEHOLDER)),
      ...games,
    ];
});

console.log('original', divTops, divBots);
let oocRotation = (CURRENT_SEASON % 6) + 1;
while (oocRotation--) rotateArraysWithPivot(divTops, divBots);
console.log('after rotation', divTops, divBots);

const oocSchedule = [];
for (i in divTops) {
  const division1 = teamsByDivision[divTops[i]];
  const division2 = teamsByDivision[divBots[i]];
  for (let w = 0; w < crossDivMatrix.length; w += 1) {
    const games = crossDivMatrix[w];
    const week = games.map(([a, h]) => {
      const t1 = division1[a];
      const t2 = division2[h];
      const game = [t1.abbr, t2.abbr];
      if (w % 2 === CURRENT_SEASON % 2) {
        game.reverse();
      }
      return game;
    });
    if (!oocSchedule[w]) oocSchedule[w] = [];
    oocSchedule[w] = [...oocSchedule[w], ...week];
  }
}

schedule = [
  ...oocSchedule,
  ...crossDivSchedule,
  ...schedule,
];

console.log(`Schedule generated for ${schedule.length} weeks.`);
teams.sort((a, b) => a.id - b.id).forEach(t => {
  const [teamSchedule, homeGames] = getTeamSchedule(schedule, t.abbr);
  console.log(t.name);
  console.log(homeGames, 'home games');
  console.log(teamSchedule);
});

// fs.writeFileSync(path.resolve(__dirname, '../data/schedule.json'), JSON.stringify(schedule));