const names = require('human-names');
const words = require('random-words');
const teams = require('../data/teams.json');
const capitalize = require('capitalize');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');

const { POSITIONS, attributeMap } = require('../shared/constants');

const positionsPerTeam = {
  [POSITIONS.STRIKER]: 3,
  [POSITIONS.SWEEPER]: 5,
  [POSITIONS.DEFENDER]: 4,
  [POSITIONS.CHAD]: 2,
  [POSITIONS.GOALKEEPER]: 2,
};

const getAttributes = position => attributeMap[position].map(attr => Math.max(attr, Math.round(Math.random() * 100) / 10));

const getRandomPrefix = () => {
  const prefixes = [
    'Mc',
    'O\'',
    'van ',
    'de ',
    'van der ',
    'Di',
    'D\'',
    'J\'',
  ];
  return prefixes[Math.floor(Math.random() * prefixes.length)];
}

const getRandomSuffix = () => {
  const prefixes = [
    'inen',
    'son',
    'smith',
    ', Jr.',
    ' III',
    'ington',
    'face',
    'by',
  ];
  return prefixes[Math.floor(Math.random() * prefixes.length)];
}

const getAge = (current) => {
  const generate = (x) => 3 * Math.tan((Math.PI * x) + (Math.PI / 2)) + 26;
  let age = Math.round(generate(Math.random()));
  while (age > 48 || age < 18) {
    age = Math.round(generate(Math.random()));
  }
  return age;
}

const generatePositionPlayers = (position, team) => {
  const iterations = positionsPerTeam[position];
  const result = [];
  for (let p = 0; p < iterations; p++) {
    const lastNameLength = Math.random() > 0.95 ? 2 : 1;
    const prefix = Math.random() > 0.88 ? getRandomPrefix() : '';
    const suffix = Math.random() > 0.92 ? getRandomSuffix() : '';
    const player = {
      id: uuid(),
      first: names.allRandom(),
      last: `${prefix}${words(lastNameLength).map(capitalize).join('-')}${suffix}`,
      position,
      age: getAge(),
      number: Math.floor(Math.random() * 100),
      team,
      attributes: getAttributes(position),
    };
    const overall = player.attributes.reduce((agg, attr) => agg + attr, 0);
    if (overall > 50) {
      console.log(player.first, player.last, overall);
    }
    result.push(player);
  }
  return result;
}

let players = [];
teams.forEach(team => {
  Object.values(POSITIONS).forEach(pos => {
    const result = generatePositionPlayers(pos, team.id);
    players = [...players, ...result];
  });
});

const ageMap = players.reduce((agg, player) => ({
  ...agg,
  [player.age]: (agg[player.age] || 0) + 1,
}), {});

Object.entries(ageMap).forEach(([age, count]) => console.log(
  age,
  count,
  `${Math.round(10000 * (count / players.length)) / 100}%`
));


fs.writeFileSync(path.resolve(__dirname, '../data/players.json'), JSON.stringify(players, null, 2));