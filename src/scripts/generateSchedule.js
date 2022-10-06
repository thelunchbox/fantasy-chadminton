const teams = require('../data/teams.json');
const divisions = require('../data/divisions.json');
const { SCHEDULE_PLACEHOLDER } = require('../shared/constants');

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

const getTeamByField = (field, value) => teams.find(team => team[field] === value);

const divisionMatrix = getDivisionScheduleMatrix(9, 2);
const crossDivMatrix = getSisterDivisionScheduleMatrix(9);
const [divTops, divBots] = getDivisionParings();

const teamsByDivision = teams.sort(() => Math.random() - 0.5).reduce((agg, team) => {
  const { divId } = team;
  if (!agg[divId]) {
    agg[divId] = [];
  }
  agg[divId].push(team);
  return agg;
}, {});

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

// well we're going to take care of the first team later
crossDivMatrix.shift();
const crossDivSchedule = [];

for (i in divTops) {
  // get sister divisions
  const division1 = teamsByDivision[divTops[i]];
  const division2 = teamsByDivision[divBots[i]];
  for (let w = 0; w < crossDivMatrix.length; w+=1) {
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

schedule.map((week, index) => {
  if (index === week / 2) {
    rotateArraysWithPivot(divTops, divBots);
  }
    const byeTeams = week.filter(game => game.includes(SCHEDULE_PLACEHOLDER)).map(([away, home]) => {
      const isHome = away === SCHEDULE_PLACEHOLDER;
      const team = getTeamByField('abbr', isHome ? home : away);
      team.isHome = isHome;
      return team;
  });
    const games = [];
    while (byeTeams.length > 0) {
      const t1 = byeTeams.shift();
      const otherDiv = divBots[divTops.indexOf(t1.divId)];
      const t2 = byeTeams.find(t => t.divId === otherDiv);
      const teamIndex = byeTeams.indexOf(t2);
      byeTeams.splice(teamIndex, 1);
      const game = [t1.abbr, t2.abbr];
      if (index % 2 === 0) game.reverse();
      games.push(game);
    }
    return [
      ...week.filter(game => {
        console.log('filtering out...', game);
        return !game.includes(SCHEDULE_PLACEHOLDER);
      }),
      ...games,
    ];
});

schedule = [
  ...crossDivSchedule,
  ...schedule,
];

console.log(schedule);