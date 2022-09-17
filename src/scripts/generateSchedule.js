const teams = require('../data/teams.json');
const divisions = require('../data/divisions.json');
const { SCHEDULE_PLACEHOLDER } = require('../shared/constants');

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
    // rotate teams
    // the first team in the top row stays as a pivot, so we take the second (index 1)
    const demote = topRow.splice(1, 1)[0];
    // then we take the last team from the bottom row
    const promote = bottomRow.pop();
    // team from the top goes to the beginning of the bottom
    bottomRow.unshift(demote);
    // team from the bottom goes to the end of the top
    topRow.push(promote);
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
    const homeDivision = (w + 1) % 2;
    let away, home;
    if (w % 2 === 0) {
      away = topRow;
      home = bottomRow;
    } else {
      away = bottomRow;
      home = topRow;
    }
    for (let g = 0; g < home.length; g+=1) {
      week.push([homeDivision, away[g], home[g]]);
    }
    schedule.push(week);
    bottomRow.push(bottomRow.shift());
  }

  return schedule;
};

const divisionMatrix = getDivisionScheduleMatrix(9, 2);
const crossDivMatrix = getSisterDivisionScheduleMatrix(9);

const teamsByDivision = teams.sort(() => Math.random() - 0.5).reduce((agg, team) => {
  const { divId } = team;
  if (!agg[divId]) {
    agg[divId] = [];
  }
  agg[divId].push(team);
  return agg;
}, {});

const schedule = [];

for (d in teamsByDivision) {
  const division = teamsByDivision[d];
  console.log(division);
  for (let w = 0; w < divisionMatrix.length; w+=1) {
    const games = divisionMatrix[w];
    const week = games.map(([a, h]) => {
      console.log(a, h);
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

console.log(schedule);