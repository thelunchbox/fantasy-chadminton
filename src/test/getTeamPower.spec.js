const { getTeamPower, getTeamPlayers } = require('../shared/utils');
const teams = require('../data/teams.json');
const players = require('../data/players-keep.json');

const arr = teams.map(t => ({
  id: t.id,
  name: t.name,
  nickname: t.nickname,
  score: getTeamPower(getTeamPlayers(t, players)),
})).sort((a, b) => b.score - a.score);

console.log(arr.map(({ id, name, nickname, score }) => `${id} ${name} ${score}`));