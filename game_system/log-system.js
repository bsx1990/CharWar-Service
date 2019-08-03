module.exports = {
  infor,
  error,
  object,
  noPrefix
};

function infor(text) {
  console.log(`INFOR: ${text}`);
}

function error(text) {
  console.log(`!!!ERROR: ${text}`);
}

function object(obj) {
  console.log(obj);
}

function noPrefix(text) {
  console.log(text);
}
