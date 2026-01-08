const env = require('dotenv');

const result = env.config();
if (result.error) {
  throw result.error;
}
const { parsed: envs } = result;
module.exports = envs;