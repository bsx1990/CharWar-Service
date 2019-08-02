module.exports = {
  infor,
  error,
  object
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
