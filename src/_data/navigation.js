const { getNavigation } = require('../../lib/navigation');

module.exports = async function () {
  return getNavigation('/');
};
