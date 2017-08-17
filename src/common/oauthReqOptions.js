const CONFIG = require('./config.js');


module.exports = {
  url: `${CONFIG.API_ROOT}/oauth/token`,
  form: {
    audience: `${CONFIG.API_ROOT}`,
    grant_type: 'password',
    username: `${CONFIG.USERNAME}`,
    password: `${CONFIG.PASSWORD}`,
  },
  headers: {
    'Authorization': `Basic ${Buffer.from(`${CONFIG.CLIENT_ID}:${CONFIG.CLIENT_SECRET}`).toString('base64')}`,
  },
}
