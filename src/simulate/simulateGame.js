const { POSITIONS, EVENT_TYPES: EVENT } = require('../shared/constants');
const { getRandomItem, getRandomWeighted, scoreSort } = require('../shared/utils');

const MINTONS = [POSITIONS.STRIKER, POSITIONS.SWEEPER, POSITIONS.DEFENDER];
const OFFENSE = [POSITIONS.STRIKER, POSITIONS.SWEEPER];

const processEvent = {
  [EVENT.BLOCK]: (away, home, homePosession) => {
    return [{ posession: !homePosession }];
  },
  [EVENT.FAST_BREAK]: () => {
    const dice = Math.random();
    if (dice < 0.4) return [null, EVENT.GOAL];
    if (dice < 0.8) return [null, EVENT.SAVE];
    return [null, EVENT.TURNOVER];
  },
  [EVENT.STEAL]: (away, home, homePosession) => {
    return [{ posession: !homePosession }];
  },
  [EVENT.SAVE]: (away, home, homePosession) => {
    return [{ posession: !homePosession }];
  },
  [EVENT.STICK_BREAK]: (away, home) => {
    const candidates = [...away.players, ...home.players].filter(p => MINTONS.includes(p.position));
    const { id } = getRandomItem(candidates);
    return [{ player: id, type: EVENT.STICK_BREAK }, EVENT.FACEOFF];
  },
  [EVENT.FACEOFF]: (away, home) => {
    const candidates = [...away.players, ...home.players].filter(p => p.position === POSITIONS.CHAD);
    const player = getRandomItem(candidates);
    return [{ player: player.id, type: EVENT.FACEOFF, posession: player.team === home.id }];
  },
  [EVENT.GOAL]: (away, home, homePosession) => {
    const candidates = (homePosession ? home : away).players.sort(scoreSort);
    const player = getRandomWeighted(candidates);
    console.log('Goal by', player.first, player.last);
    return [{ player: player.id, type: EVENT.GOAL, posession: !homePosession }];
  },
  [EVENT.TURNOVER]: (away, home, homePosession) => {
    return [{ posession: !homePosession }];
  },
  [EVENT.HIT]: (away, home, homePosession) => {
    return [{}];
  },
}

function simulateGame(away, home) {
  console.log('Simulating', away.name, away.nickname, 'at', home.name, home.nickname);

  const distribution = [
    Math.floor(Math.random() * 10) + 6, // FAST_BREAK
    Math.floor(Math.random() * 10) + 16, // STEAL
    Math.floor(Math.random() * 10) + 25, // BLOCK
    Math.floor(Math.random() * 10) + 25, // SAVE
    Math.floor(Math.random() * 10) + 3, // STICK_BREAK
    Math.floor(Math.random() * 10) + 15, // HIT
    Math.floor(Math.random() * 10) + 12, // GOAL
    Math.floor(Math.random() * 10) + 3, // FACEOFF
    Math.floor(Math.random() * 10) + 25, // TURNOVER
  ];

  let eventCount = Math.floor(Math.random() * 15) + 60;
  const events = [];

  let awayScore = 0;
  let homeScore = 0;
  let homePosession = false;
  let event, next = EVENT.FACEOFF;
  let overtime = false;

  while (eventCount > 0 || awayScore === homeScore) {
    const type = next || getRandomItem(EVENT, { distribution });
    console.log('>>', (homePosession ? home.abbr : away.abbr), 'processing event', type, next ? '(forced)' : '');
    [event, next] = processEvent[type](away, home, homePosession);
    // console.log('event processed:', event);
    if (!event) continue;

    if (event.type === EVENT.GOAL) {
      if (homePosession) {
        homeScore++;
      } else {
        awayScore++;
      }
      console.log('**********');
      console.log(away.abbr, awayScore, ' - ', home.abbr, homeScore);
      console.log('**********');
    }
    if (event.posession !== undefined) {
      homePosession = event.posession;
    }
    eventCount -= 1;
    if (eventCount === 0 && awayScore === homeScore && !overtime) {
      console.log('#### OVERTIME ####');
      overtime = true;
      next = EVENT.FACEOFF;
    }
  }

  console.log('**********');
  console.log('** FINAL **');
  console.log(away.abbr, awayScore, ' - ', home.abbr, homeScore, overtime ? '(OT)' : '');
  console.log('**********');
}

module.exports = {
  simulateGame,
};