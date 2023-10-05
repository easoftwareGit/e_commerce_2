const uuidRegex = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');

function validateUuid(uuid) {
  try {
    return uuidRegex.test(uuid);
  } catch (err) {
    return false
  }
}

module.exports = { uuidRegex, validateUuid };