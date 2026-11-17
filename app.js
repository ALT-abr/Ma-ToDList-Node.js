const express = require("express");
const tasksRouter = require("./routes/tasks.routes");


const app = express();
const PORT = 3000;

const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');
// app = application Express DÉJÀ définie plus haut
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

require('./tempsReel').definirServeurWebSocket(wss);

app.use(express.json());
app.use(express.static('public'));

app.get("/", (req, res) => {
  res.json({ message: "API ToDo opérationnelle" });
});

app.use("/tasks", tasksRouter);

server.listen(PORT, () => {
  console.log(`API + WebSocket sur http://localhost:${PORT}`);
});
