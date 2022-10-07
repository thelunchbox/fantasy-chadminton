const { POSITIONS } = require('../shared/constants');

const getTeamPlayers = (team, players) => players.filter(p => p.team === team.id)

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
  const i = len - Math.ceil(Math.sqrt(Math.random() * (len * len)));
  return array[i];
}

const goalOpportunityScore = {
  [POSITIONS.STRIKER]: 5,
  [POSITIONS.SWEEPER]: 4,
  [POSITIONS.DEFENDER]: 1.2,
  [POSITIONS.CHAD]: 0.8,
  [POSITIONS.GOALKEEPER]: 0.1,
};

function scoreRating(p) {
  const [speed, quick, shot, power, tough, stamina, heart] = p.attributes;
  return (
    shot +
    (quick / 2) +
    (stamina / 2) +
    (heart / 3) +
    goalOpportunityScore[p.position]
  );
}

function faceoffRating(p) {
  const [speed, quick, shot, power, tough, stamina, heart] = p.attributes;
  return (
    quick +
    tough +
    (power / 2) +
    (heart / 2)
  );
}

function goalieRating(p) {
  const [speed, quick, shot, power, tough, stamina, heart] = p.attributes;
  return (
    quick +
    heart +
    tough +
    (power / 3)
  );
}

function passerRating(p) {
  const [speed, quick, shot, power, tough, stamina, heart] = p.attributes;
  return (
    speed +
    stamina +
    (heart * 2) +
    (quick / 2)
  );
}

function defenderRating(p) {
  const [speed, quick, shot, power, tough, stamina, heart] = p.attributes;
  return (
    quick +
    power +
    heart +
    (stamina / 2) +
    (tough * 2)
  );
}

function playmakerRating(p) {
  const [speed, quick, shot, power, tough, stamina, heart] = p.attributes;
  return (
    quick +
    heart +
    stamina +
    (speed * 2) +
    (tough / 2)
  );
}

const getTeamByField = (teams, field, value) => teams.find(team => team[field] === value);

module.exports = {
  getRandomItem,
  getRandomWeighted,
  getTeamByField,
  getTeamPlayers,
  getTeamPower,
  defenderRating,
  faceoffRating,
  goalieRating,
  passerRating,
  playmakerRating,
  scoreRating,
};