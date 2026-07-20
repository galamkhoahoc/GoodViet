const hash = jest.fn();
const compare = jest.fn();
const bcrypt = { hash, compare };

module.exports = {
  __esModule: true,
  default: bcrypt,
  hash,
  compare,
};
