import namor from "namor";

var range = function range(len) {
  var arr = [];
  for (var i = 0; i < len; i++) {
    arr.push(i);
  }
  return arr;
};

var newPerson = function newPerson() {
  var statusChance = Math.random();
  return {
    firstName: namor.generate({ words: 1, numbers: 0 }),
    lastName: namor.generate({ words: 1, numbers: 0 }),
    age: Math.floor(Math.random() * 30),
    visits: Math.floor(Math.random() * 100),
    progress: Math.floor(Math.random() * 100),
    status: statusChance > 0.66 ? "relationship" : statusChance > 0.33 ? "complicated" : "single"
  };
};

export default function makeData() {
  for (var _len = arguments.length, lens = Array(_len), _key = 0; _key < _len; _key++) {
    lens[_key] = arguments[_key];
  }

  var makeDataLevel = function makeDataLevel() {
    var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

    var len = lens[depth];
    return range(len).map(function (d) {
      return Object.assign({}, newPerson(), {
        subRows: lens[depth + 1] ? makeDataLevel(depth + 1) : undefined
      });
    });
  };

  return makeDataLevel();
}