const OFFENSE = function () {
  OFFENSE.FASTBREAK = function () {
    OFFENSE.FASTBREAK.SHOT = function () {
      return 'offense/fastbreak/shot';
    }
    OFFENSE.FASTBREAK.TURNOVER = function () {
      return 'offense/fastbreak/turnover';
    }
    return 'offense/fastbreak';
  }
  OFFENSE.GOAL = function () {
    return 'offense/goal';
  }
  OFFENSE.SHOT = function () {
    return 'offense/shot';
  }
  OFFENSE.PASS = function (evaluate) {
    OFFENSE.PASS.FAIL = function () {
      return 'offense/pass/fail';
    }
    OFFENSE.PASS.SUCCESS = function () {
      return 'offense/pass/success';
    }
    if (evaluate !== undefined) {
      return evaluate ? OFFENSE.PASS.SUCCESS() : OFFENSE.PASS.FAIL();
    }
    return 'offense/pass';
  }
  OFFENSE.TURNOVER = function () {
    return 'offense/turnover';
  }
  OFFENSE.FACEOFF = function () {
    return 'offense/faceoff';
  }
  return 'offense';
}

const DEFENSE = function () {
  DEFENSE.SAVE = function () {
    return 'defense/save';
  }
  DEFENSE.STEAL = function () {
    return 'defense/steal';
  }
  DEFENSE.HIT = function () {
    return 'defense/hit';
  }
  DEFENSE.BLOCK = function () {
    return 'defense/block';
  }
  return 'defense';
}

console.log(typeof OFFENSE === 'function');
console.log(typeof OFFENSE.FACEOFF === 'function');
console.log(typeof OFFENSE.FASTBREAK === 'function');
console.log(OFFENSE.prototype);
console.log(OFFENSE.FACEOFF());
console.log(typeof DEFENSE === 'function');

const x = () => {
  x.y = () => {
    return 'y';
  }
  return 'x';
}

console.log(typeof x);
console.log(typeof x.y);
console.log(x());
console.log(x.y());

module.exports = {
  EVENT_TYPES: {
    OFFENSE,
    DEFENSE,
  }
};