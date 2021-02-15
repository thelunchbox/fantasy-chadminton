const names = require('human-names');
const words = require('random-words');
const teams = require('../data/teams.json');
const capitalize = require('capitalize');
const uuid = require('uuid').v4;
const fs = require('fs');
const path = require('path');

const POSITIONS = {
  STRIKER: 'striker',
  SWEEPER: 'sweeper',
  DEFENDER: 'defender',
  CHAD: 'chad',
  GOALKEEPER: 'goalkeeper',
};

const positionsPerTeam = {
  [POSITIONS.STRIKER]: 3,
  [POSITIONS.SWEEPER]: 5,
  [POSITIONS.DEFENDER]: 4,
  [POSITIONS.CHAD]: 2,
  [POSITIONS.GOALKEEPER]: 2,
};

const attributes = [
  'speed',
  'quick',
  'shot',
  'power',
  'tough',
  'stamina',
  'heart',
];

const attributeMap = {
  [POSITIONS.STRIKER]: [4, 4, 5, 3, 2, 4, 1],
  [POSITIONS.SWEEPER]: [3, 5, 4, 4, 3, 5, 1],
  [POSITIONS.DEFENDER]: [2, 4, 2, 5, 5, 3, 1],
  [POSITIONS.CHAD]: [2, 3, 1, 5, 5, 4, 3],
  [POSITIONS.GOALKEEPER]: [1, 5, 1, 3, 6, 4, 1],
}

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