const { POSITIONS, EVENT, RESULT } = require('../shared/constants');
const {
  getRandomItem,
  getRandomWeighted,
  getTeamPower,
  defenderRating,
  faceoffRating,
  goalieRating,
  passerRating,
  playmakerRating,
  scoreRating,
} = require('../shared/utils');

const sortBy = f => (a, b) => f(b) - f(a);

const MINTONS = [POSITIONS.STRIKER, POSITIONS.SWEEPER, POSITIONS.DEFENDER];
const OFFENSE = [POSITIONS.STRIKER, POSITIONS.SWEEPER];

// how many goals can be scored before the goalie will be yanked
const GOAL_TOLERANCE = 5;

const teamBalance = (a, b) => {
  const ap = getTeamPower(a.players);
  const bp = getTeamPower(b.players);
  const total = ap + bp;
  const x = ap / total;
  return [x, 1 - x];
};

const processEvent = {
  [EVENT.FASTBREAK]: (prev) => {
    const r2 = Math.random();
    if (r2 < 0.8) return [{ player: prev.player, log: 'offense/fastBreak/shot' }, EVENT.SHOT];
    else return [{ turnover: true, log: 'offense/fastBreak/turnover' }];
  },
  [EVENT.SHOT]: (offense, defense, prev) => {
    const playmaker = prev.player ?
      offense.players.find(p => p.id === prev.player) :
      getRandomWeighted(offense.players.filter(p => p.position !== POSITIONS.GOALKEEPER).sort(sortBy(scoreRating)));
    const goalie = defense.goalie;
    const gp = goalieRating(goalie);
    const sp = scoreRating(playmaker);
    const goal = Math.random() > sp / (gp * 1.2);
    if (goal) {
      return [{ assist: offense.assistTo, player: playmaker.id, type: RESULT.GOAL, turnover: true, log: 'offense/goal' }];
    }
    return [{ player: goalie.id, type: RESULT.SAVE, turnover: true, log: 'defense/save' }];
  },
  [EVENT.CONTEST]: (offense, defense) => {
    const playmaker = getRandomWeighted(offense.players.filter(p => p.position !== POSITIONS.GOALKEEPER).sort(sortBy(playmakerRating)));
    const defender = getRandomWeighted(defense.players.filter(p => p.position !== POSITIONS.GOALKEEPER).sort(sortBy(defenderRating)));
    const pRating = playmakerRating(playmaker) + (Math.random() * 5);
    const dRating = defenderRating(defender) + (Math.random() * 5);
    const pPower = pRating / (pRating + dRating);
    const dPower = 1 - pPower;
    if (dPower > pPower) {
      const diff = dPower - pPower;
      const r = Math.random();
      if (r < diff * 3) return [{ player: defender.id, type: RESULT.STEAL, turnover: true, log: 'defense/steal' }, Math.random() < 0.25 ? EVENT.FASTBREAK : null];
      if (r < diff * 8) return [{ player: defender.id, type: RESULT.HIT, turnover: Math.random() < 0.25, log: 'defense/hit' }];
      return [{ player: defender.id, type: RESULT.BLOCK, turnover: Math.random() < 0.25, log: 'defense/block' }];
    }
    if (dPower < pPower) {
      const diff = pPower - dPower;
      const r = Math.random();
      if (r < diff * 0.75) {
        return [{ player: playmaker.id, log: 'offense/fastbreak' }, EVENT.FASTBREAK];
      }
      if (r < diff * 5) {
        return [{ player: playmaker.id, log: 'offense/shot' }, EVENT.SHOT];
      }
      const pp = passerRating(playmaker) + (Math.random() * 5);
      if (pp >= 30) offense.assistTo = playmaker;
      // passerRating under 22 is an errant pass turnover
      return [{ turnover: pp < 30, log: 'offense/pass' + (pp < 30 ? '/fail' : '/success') }, Math.random() < 0.2 ? EVENT.SHOT : null];
    }
  },
  [EVENT.FACEOFF]: (home, away) => {
    const candidates = [...home.players, ...away.players]
      .filter(p => p.position === POSITIONS.CHAD)
      .sort(sortBy(faceoffRating));
    const player = getRandomWeighted(candidates);
    return [{ player: player.id, type: EVENT.FACEOFF, posession: player.team === home.id, log: 'faceoff' }];
  },
  [EVENT.TURNOVER]: () => {
    return [{ turnover: true, log: 'turnover' }];
  },
}

function simulateGame(away, home, logger = console.log) {
  logger('Simulating', away.name, away.nickname, 'at', home.name, home.nickname);
  // set starting goalies
  away.goalie = away.players
    .filter(p => p.position === POSITIONS.GOALKEEPER)
    .sort(sortBy(goalieRating))[Math.random() > 0.9 ? 1 : 0];
  home.goalie = home.players
    .filter(p => p.position === POSITIONS.GOALKEEPER)
    .sort(sortBy(goalieRating))[Math.random() > 0.9 ? 1 : 0];

  logger('*** STARTING GOALKEEPERS ***');
  logger(away.name, '#', away.goalie.number, away.goalie.first, away.goalie.last);
  logger(home.name, '#', home.goalie.number, home.goalie.first, home.goalie.last);

  const distribution = [
    75, // contest
    11, // faceoff
    0, // fastbreak - we never want these randomly
    0, // shot - we never want these randomly
    14, // turnover
  ];

  let eventCount = Math.floor(Math.random() * 40) + 120;
  const events = [];

  let awayScore = 0;
  let homeScore = 0;
  let homePosession = false;
  let event, next = EVENT.FACEOFF;
  let overtime = false;

  while (eventCount > 0 || awayScore === homeScore) {
    const type = next || getRandomItem(EVENT, { distribution });
    const offense = type === EVENT.FACEOFF || homePosession ? home : away;
    const defense = type === EVENT.FACEOFF || homePosession ? away : home;
    if (!processEvent[type]) throw new Error(`What is ${type}?`);
    [event, next] = processEvent[type](offense, defense, events[events.length - 1]);
    logger(eventCount, '>>', homePosession ? home.abbr : away.abbr, '-', event.log);
    // logger('event processed:', event);
    if (!event) continue;

    if (event.type === RESULT.GOAL) {
      if (homePosession) {
        homeScore++;
        if (homeScore > GOAL_TOLERANCE && (homeScore - awayScore > 3) && eventCount > 20 && !away.goalieSub) {
          away.goalieSub = true;
          logger('-------------------------------------------');
          logger('GOALKEEPER SUBSTITUTION');
          away.goalie = away.players.filter(p => p.position === POSITIONS.GOALKEEPER).find(p => p.id !== away.goalie.id);
          logger(away.name, '#', away.goalie.number, away.goalie.first, away.goalie.last);
        }
      } else {
        awayScore++;
        if (awayScore > GOAL_TOLERANCE && (awayScore - homeScore > 3) && eventCount > 20 && !home.goalieSub) {
          home.goalieSub = true;
          logger('-------------------------------------------');
          logger('GOALKEEPER SUBSTITUTION');
          home.goalie = home.players.filter(p => p.position === POSITIONS.GOALKEEPER).find(p => p.id !== home.goalie.id);
          logger(home.name, '#', home.goalie.number, home.goalie.first, home.goalie.last);
        }
      }
      logger('-------------------------------------------');
      logger('  GOAL  ', away.abbr, awayScore, ' - ', home.abbr, homeScore);
      logger('-------------------------------------------');
    }
    if (event.turnover) {
      (homePosession ? home : away).assistTo = null;
      homePosession = !homePosession;
    }
    if (event.posession !== undefined) {
      home.assistTo = null;
      away.assistTo = null;
      homePosession = event.posession;
    }
    if (!next) eventCount -= 1;
    if (eventCount === 0 && awayScore === homeScore && !overtime) {
      logger('#### OVERTIME ####');
      overtime = true;
      next = EVENT.FACEOFF;
    }
    events.push(event);
  }

  logger('-------------------------------------------');
  logger('** FINAL **');
  logger(away.abbr, awayScore, ' - ', home.abbr, homeScore, overtime ? '(OT)' : '');
  logger('-------------------------------------------');

  return { awayScore, homeScore, overtime, events };
}

module.exports = {
  processEvent,
  simulateGame,
};