var http = require("http");
var firmata = require("firmata");
console.log("Priklop Arduina");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Aktiviramo pin 13");
    board.pinMode(13, board.MODES.OUTPUT);
    
    http.createServer(function(req, res){
        var parts = req.url.split("/"),
        operator = parseInt(parts[1],10);
        
        if (operator == 0) {
            console.log("Izključevanje LED");
            board.digitalWrite(13, board.LOW);
        }
        else if (operator == 1) {
            console.log("Vključevanje LED");
            board.digitalWrite(13, board.HIGH);
        }
        
        res.writeHead(200, {"Content-Type": "text/plain"});
        res.write("Za test vpišite IP naslov, port in 0 ali 1 \n");
        res.end("Vrednost vnešenega operatorja je: " + operator);
    }).listen(8080, "192.168.1.130");
});