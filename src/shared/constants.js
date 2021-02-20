const EVENT = {
  CONTEST: 'contest',
  FACEOFF: 'faceoff',
  TURNOVER: 'turnover',
};

const RESULT = {
  BLOCK: 'block',
  BREAK: 'break',
  GOAL: 'goal',
  HIT: 'hit',
  PASS: 'pass',
  SAVE: 'save',
  STEAL: 'steal',
};

const POSITIONS = {
  STRIKER: 'striker',
  SWEEPER: 'sweeper',
  DEFENDER: 'defender',
  CHAD: 'chad',
  GOALKEEPER: 'goalkeeper',
};

const attributeMap = {
  [POSITIONS.STRIKER]: [4, 4, 5, 3, 2, 4, 1],
  [POSITIONS.SWEEPER]: [3, 5, 4, 4, 3, 5, 1],
  [POSITIONS.DEFENDER]: [2, 4, 2, 5, 5, 3, 1],
  [POSITIONS.CHAD]: [2, 3, 1, 5, 5, 4, 3],
  [POSITIONS.GOALKEEPER]: [1, 5, 1, 3, 6, 4, 1],
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

module.exports = {
  EVENT,
  POSITIONS,
  RESULT,
  attributes,
  attributeMap,
};