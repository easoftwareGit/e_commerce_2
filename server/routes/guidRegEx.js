const guidRegex = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');

function validateGuid(guid) {
  try {
    return guidRegex.test(guid);
  } catch (err) {
    return false
  }
}

module.exports = { guidRegex, validateGuid };