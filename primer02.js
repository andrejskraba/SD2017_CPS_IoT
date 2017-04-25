var http = require("http");
var firmata = require("firmata");
console.log("Priklop Arduina");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Aktiviramo pin 13");
    board.pinMode(13, board.MODES.OUTPUT);
    console.log("Aktiviramo pin 8");
    board.pinMode(8, board.MODES.OUTPUT);
    
    http.createServer(function(req, res){
        var parts = req.url.split("/");
        var operator1 = parseInt(parts[1],10);
        var operator2 = parseInt(parts[2],10);
        
        if (operator1 == 0) {
            console.log("Izključevanje LED");
            board.digitalWrite(13, board.LOW);
        }
        if (operator1 == 1) {
            console.log("Vključevanje LED");
            board.digitalWrite(13, board.HIGH);
        }
        
        if (operator2 == 0) {
            console.log("Izključevanje LED");
            board.digitalWrite(8, board.LOW);
        }
        if (operator2 == 1) {
            console.log("Vključevanje LED");
            board.digitalWrite(8, board.HIGH);
        }        
        
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Za test vpisite IP naslov, port in /0/0 ali /1/1 ali /0/1 ali /1/0 \n");
        res.end("Vrednost operatorjev: " + operator1 + "|" + operator2);
    }).listen(8080, "192.168.1.130");
});