const app = require("http").createServer();
const IO = require("socket.io")(app);

const PORT = 1001;

app.listen(PORT);
IO.on("connection", function(socket) {
  socket.on("clickCard", function() {
    console.log("received clickCard request");
  });
});

console.log("app listen at" + PORT);
