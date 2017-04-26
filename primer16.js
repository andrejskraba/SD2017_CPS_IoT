var http = require("http").createServer(handler); // ob zahtevi req -> handler
var firmata = require("firmata");
var fs = require("fs"); // knjižnjica za delo z datotekami (File System fs)
var io = require("socket.io").listen(http); // knjiž. za komunik. prek socket-a 

console.log("Priklop Arduina");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Aktiviramo analogni pin 0");
    board.pinMode(0, board.MODES.ANALOG);
    console.log("Aktiviramo analogni pin 1");
    board.pinMode(1, board.MODES.ANALOG);
    console.log("Aktiviramo pin 2");
    board.pinMode(2, board.MODES.OUTPUT); // pin za smer na H-mostu
    console.log("Aktiviramo pin 3");
    board.pinMode(3, board.MODES.PWM); // Pulse Width Modulation - hitrost
});

function handler(req, res) {
    fs.readFile(__dirname + "/primer16.html",
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

var želenaVrednost = 0; // želeno vrednost postavimo na 0
var dejanskaVrednost = 0; // dejansko vrednost postavimo na 0
var faktor =0.1; // faktor, ki določa hitrost doseganja želenega stanja

var Kp = 0.5; // proporcionalni faktor PID kontrolerja
var Ki = 0.008; // integralni faktro PID kontrolerja
var Kd = 0.15; // diferencialni faktor PID kontrolerja

var err = 0; // odstopanje med želeno in dejansko ovrednostjo (error)
var errVsota = 0; // vsota odstopanj kot integral
var dErr = 0; // diferenca odstopanja
var zadnjiErr = 0; // da ohranimo vrednost prejšnje napake pri določitvi odvoda

var readAnalogPin0Flag = 1; // zastavica za branje pina 0, če je želeno stanje določeno prek potenciometra


console.log("Zagon sistema"); // izpis sporočila o zagonu

board.on("ready", function(){
    console.log("Plošča pripravljena");
    board.analogRead(0, function(value){
        if (readAnalogPin0Flag == 1) želenaVrednost = value; // neprekinjeno branje pina A0
    });
    board.analogRead(1, function(value){
        dejanskaVrednost = value; // neprekinjeno branje pina A1
    });
    
    startKontrolniAlgoritem(); // poženemo kontrolni algoritem
    
    io.sockets.on("connection", function(socket){
        setInterval(pošljiVrednosti, 40, socket); // na 40ms pošlj. vred.
        
        socket.on("pošljiPozicijo", function(pozicija) {
            readAnalogPin0Flag = 0; // we don't read from the analog pin anymore, value comes from GUI
            želenaVrednost = pozicija; // GUI takes control
        });
    });
    
});

function kontrolniAlgoritem () {
    err = želenaVrednost - dejanskaVrednost; // odstopanje ali error
    errVsota += err; // vsota napak (kot integral)
    dErr = err - zadnjiErr; // razlika odstopanj
    var pwm = Kp*err + Ki*errVsota + Kd*dErr; // izraz za PID kontroler (iz table)
    zadnjiErr = err; // shranimo vrednost za naslednji cikel za oceno odvoda

    if (pwm > 255) {pwm = 255}; // omejimo vrednost pwm na 255
    if (pwm < -255) {pwm = -255}; // omejimo vrednost pwm na -255
    if (pwm > 0) {board.digitalWrite(2,0)}; // določimo smer če je > 0
    if (pwm < 0) {board.digitalWrite(2,1)}; // določimo smer če je < 0
    board.analogWrite(3, Math.abs(pwm)); // zapišemo abs vrednost na pin 3
}

function startKontrolniAlgoritem () {
    setInterval(function(){kontrolniAlgoritem();}, 30); // na 30ms klic
    console.log("Start kontrolni algoritem");
}

function pošljiVrednosti(socket) {
    socket.emit("klientBeriVrednosti",
    {
        "želenaVrednost": želenaVrednost,
        "dejanskaVrednost": dejanskaVrednost
    });
};