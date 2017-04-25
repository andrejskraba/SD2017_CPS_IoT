var http = require("http").createServer(handler); // ob zahtevi req -> handler
var firmata = require("firmata");
var fs = require("fs"); // knjižnjica za delo z datotekami (File System fs)
var io = require("socket.io").listen(http); // knjiž. za komunik. prek socket-a 

console.log("Priklop Arduina");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Aktiviramo pin 13");
    board.pinMode(13, board.MODES.OUTPUT);
    console.log("Aktiviramo pin 8");
    board.pinMode(8, board.MODES.OUTPUT);
});

function handler(req, res) {
    fs.readFile(__dirname + "/primer04.html",
    function(err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Napaka pri nalaganju html strani!");
        }
        res.writeHead(200);
        res.end(data);
    });
}

http.listen(8080); // strežnik bo poslušal na vratih 8080

io.sockets.on("connection", function(socket) {
    socket.on("ukazArduinu", function(štUkaza) {
        if (štUkaza == "1") {
            board.digitalWrite(13, board.HIGH); // zapišemo +5V na p. 13
        }
        if (štUkaza == "0") {
            board.digitalWrite(13, board.LOW); // zapišemo 0V na pin13
        }
        if (štUkaza == "3") {
            board.digitalWrite(8, board.HIGH); // zapišemo +5V na p. 13
        }
        if (štUkaza == "2") {
            board.digitalWrite(8, board.LOW); // zapišemo 0V na pin13
        }
    });
});

