var HighFive = {};

(function (root) {

    function Game() {
        this.boardSize = 16;
        this.matrix = new Array(this.boardSize);
        this.tmpMatrix = new Array();
        this.nextNodesStack = new Array();
        this.currentNodesList = new Array();
        this.gameInProgress = false;
        this.gameScore = 0;
        this.recordScore = 0;
        this.alpha = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
        this.benchmarkMode = false;
    }

    function FastPlayer(n, e, s, w) {
        this.north = n;
        this.east = e;
        this.south = s;
        this.west = w;
    }

    function Player(n, e, s, w) {
        Object.defineProperty(this, "north", {
            get: function () { return nVal; },
            set: function (value) { nVal = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, "east", {
            get: function () { return eVal; },
            set: function (value) { eVal = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, "south", {
            get: function () { return sVal; },
            set: function (value) { sVal = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, "west", {
            get: function () { return wVal; },
            set: function (value) { wVal = value; },
            enumerable: true,
            configurable: true
        });
        var nVal = n;
        var eVal = e;
        var sVal = s;
        var wVal = w;
    }

    function Jodi(n, e, s, w) {
        Player.apply(this, arguments);
        this.name = "Jodi";
    }
    Jodi.prototype = new Player();

    function Mia(n, e, s, w) {
        Player.apply(this, arguments);
        this.name = "Mia";
    }
    Mia.prototype = new Player();

    Game.prototype.initialize = function () {
        // Allocate the game board array
        for (var i = 0; i < this.boardSize; i++) {
            this.matrix[i] = new Array(this.boardSize);
        }
    }

    Game.prototype.copyBenchMatrix = function () {
        // For stress testing, fill the board with a known pattern that can generate a fixed number of moves
        var basicMatrix = JSON.parse("[[[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1]],[[1,0,0,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0]],[[0,0,1,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[0,0,1,1],[0,0,1,1],[1,0,0,1],[0,0,1,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[0,0,1,1],[0,0,1,1],[1,0,0,1],[0,0,1,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1]],[[0,1,1,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0]],[[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0]],[[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0],[1,1,0,0]],[[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0]],[[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,0,1,1]],[[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1]],[[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,0,0,1],[0,1,1,0]],[[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0]],[[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,1,1,0]],[[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0]],[[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]],[[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,1,1,0]],[[0,0,1,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0]],[[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1]],[[1,0,0,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0]],[[0,0,1,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[0,0,1,1],[0,0,1,1],[1,0,0,1],[0,0,1,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[0,0,1,1],[0,0,1,1],[1,0,0,1],[0,0,1,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1]],[[0,1,1,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[0,1,1,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0]],[[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0]],[[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0],[1,1,0,0]],[[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[0,1,1,0]],[[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[0,0,1,1]],[[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,1,1,0],[1,0,0,1]],[[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,0,0,1],[0,1,1,0]],[[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[1,0,0,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,0,0,1],[0,1,1,0]],[[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,1,0,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[0,1,1,0],[0,1,1,0]],[[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[1,0,0,1],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,1,0,0],[1,1,0,0],[1,1,0,0]],[[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[0,0,1,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[0,1,1,0],[1,0,0,1],[1,1,0,0],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,0,0,1],[1,0,0,1],[1,0,0,1],[1,0,0,1]],[[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[1,1,0,0],[0,0,1,1],[1,0,0,1],[1,1,0,0],[0,1,1,0],[1,1,0,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[0,1,1,0],[1,0,0,1],[1,0,0,1],[0,1,1,0],[0,1,1,0]],[[0,0,1,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[0,1,1,0],[0,1,1,0],[0,0,1,1],[0,1,1,0],[1,0,0,1],[1,1,0,0],[1,1,0,0],[1,1,0,0],[1,0,0,1],[0,0,1,1],[1,1,0,0],[1,1,0,0],[0,0,1,1],[1,1,0,0],[1,1,0,0]]]");
        var letter, number, elID, turn;
        this.boardSize = 26;

        for (var i = 0; i < this.boardSize; i++) {
            for (var j = 0; j < this.boardSize; j++) {


                //If the players are in different directions as compared to the known state, update their orientation
                letter = String.fromCharCode(j + 65);
                number = i;
                elID = "#" + letter + number;
                var x = $(elID);
                newClass = "";
                oldClass = "";
                turn = true;
                if ((basicMatrix[j][i][0]) && (basicMatrix[j][i][1])) {
                    if ($(elID).hasClass("imageClass1")) {
                        turn = false;
                    }
                    else if ($(elID).hasClass("imageClass2")) {
                        var newClass = "imageClass1";
                        var oldClass = "imageClass2";
                    }
                    else if ($(elID).hasClass("imageClass3")) {
                        var newClass = "imageClass1";
                        var oldClass = "imageClass3";
                    }
                    else if ($(elID).hasClass("imageClass4")) {
                        var newClass = "imageClass1";
                        var oldClass = "imageClass4";
                    }
                }
                else if ((basicMatrix[j][i][1]) && (basicMatrix[j][i][2])) {
                    if ($(elID).hasClass("imageClass1")) {
                        var newClass = "imageClass2";
                        var oldClass = "imageClass1";
                    }
                    else if ($(elID).hasClass("imageClass2")) {
                        turn = false;
                    }
                    else if ($(elID).hasClass("imageClass3")) {
                        var newClass = "imageClass2";
                        var oldClass = "imageClass3";
                    }
                    else if ($(elID).hasClass("imageClass4")) {
                        var newClass = "imageClass2";
                        var oldClass = "imageClass4";
                    }
                }
                else if ((basicMatrix[j][i][2]) && (basicMatrix[j][i][3])) {
                    if ($(elID).hasClass("imageClass1")) {
                        var newClass = "imageClass3";
                        var oldClass = "imageClass1";
                    }
                    else if ($(elID).hasClass("imageClass2")) {
                        var newClass = "imageClass3";
                        var oldClass = "imageClass2";
                    }
                    else if ($(elID).hasClass("imageClass3")) {
                        turn = false;
                    }
                    else if ($(elID).hasClass("imageClass4")) {
                        var newClass = "imageClass3";
                        var oldClass = "imageClass4";
                    }
                }
                else if ((basicMatrix[j][i][3]) && (basicMatrix[j][i][0])) {
                    if ($(elID).hasClass("imageClass1")) {
                        var newClass = "imageClass4";
                        var oldClass = "imageClass1";
                    }
                    else if ($(elID).hasClass("imageClass2")) {
                        var newClass = "imageClass4";
                        var oldClass = "imageClass2";
                    }
                    else if ($(elID).hasClass("imageClass3")) {
                        var newClass = "imageClass4";
                        var oldClass = "imageClass3";
                    }
                    else if ($(elID).hasClass("imageClass4")) {
                        turn = false;
                    }
                }
                if (turn) {
                    $(elID).removeClass(oldClass).addClass(newClass);
                }

                // Fill the board with the players from known orientation
                if (j % 2 == 0) {
                    this.matrix[j][i] = new Jodi(basicMatrix[j][i][0], basicMatrix[j][i][1], basicMatrix[j][i][2], basicMatrix[j][i][3]);
                } else {
                    this.matrix[j][i] = new Mia(basicMatrix[j][i][0], basicMatrix[j][i][1], basicMatrix[j][i][2], basicMatrix[j][i][3]);
                }
            }
        }
    }

    Game.prototype.fillDefaultBoard = function () {
        // Create player objects for each node of the game board array

        var tmp, classTmp;
        this.grid = document.getElementById("gameBoard");
        this.clapSound = document.getElementById('clapSound');
        this.yeahSound = document.getElementById('yeahSound');
        this.highFiveYeahSound = document.getElementById('highFiveYeahSound');
        this.grid.style.msGridRows = '(1fr)[' + this.boardSize + ']';
        this.grid.style.msGridColumns = '(1fr)[' + this.boardSize + ']';
                
		// Initialize the players
        for (var i = 0; i < this.boardSize; i++) {
            for (var j = 0; j < this.boardSize; j++) {

                // Add event listener for each element
                this.el = document.createElement('img');
                tmp = Math.floor(Math.random() * 4)
                if ((tmp === 1) || (tmp === 2)) {
                    this.el.setAttribute('src', 'images/0001_Jodi-NE.png');
                }
                else {
                    this.el.setAttribute('src', 'images/Mia_NE.png');
                }
                this.el.style.msGridRow = i + 1;
                this.el.style.msGridColumn = j + 1;
                this.el.id = this.alpha[i] + j;
                classTmp = tmp + 1;
                var classVal = "imageClass" + classTmp;
                var idSearch = "#" + this.alpha[i] + j;
                this.grid.appendChild(this.el);
                $(idSearch).addClass(classVal);
                this.el.addEventListener("click", root.game.onTouch);

                // Fill the matrix with players (object pool)
                if (tmp == 0) {
                    this.matrix[j][i] = new Jodi(1, 1, 0, 0);
                }
                if (tmp == 1) {
                    this.matrix[j][i] = new Jodi(0, 1, 1, 0);
                }
                if (tmp == 2) {
                    this.matrix[j][i] = new Mia(0, 0, 1, 1);
                }
                if (tmp == 3) {
                    this.matrix[j][i] = new Mia(1, 0, 0, 1);
                }
            }
        }
    }

    Game.prototype.onTouch = function () {
        // Add the x, y co-ordinates of the nodes touched to nextNodesStack
        var clickedNodeID = this.id;
        var letter = clickedNodeID.charAt(0);
        var x = parseInt(clickedNodeID.substring(1, clickedNodeID.length));
        var y = letter.charCodeAt(0) - 65;

        if (!root.game.gameInProgress) {
            // Execute in benchmark mode to stress and evaluate performance
            if (root.game.benchmarkMode == true) {
                root.game.gameInProgress = true;
                root.game.gameScore = 1;
                root.game.runGame();
            } else {
                root.game.nextNodesStack.push([x, y]);
                root.game.gameInProgress = true;
                root.game.gameScore = 1;
                root.game.runGame();
            }
        }
    }

    Game.prototype.runGame = function () {
        // Transfer objects to be moved to currentNodesList to rotate chains of neighbors together
        while (root.game.nextNodesStack[0]) {
            root.game.currentNodesList.push(root.game.nextNodesStack.pop());
        }

        //Check neighbors to be rotated
        root.game.currentNodesList.forEach(root.game.checkNeighbors);

        // Rotate and animate
        root.game.currentNodesList.forEach(root.game.rotate);
        root.game.commitRotation();
        root.game.fireAnimation(root.game.currentNodesList);

        // Logic for continuing or finishing the game
        if (root.game.benchmarkMode == false) {
            if (root.game.nextNodesStack[0]) {
                timeout(root.game.runGame);
            } else {
                root.game.gameInProgress = false;
            }
        } else {
            if (root.game.nextNodesStack[0]) {
                timeout(root.game.runGame);
            } else {
                root.game.gameScore = 0;
                root.game.nextNodesStack = [];
				// Use known data and starting point to stress and measure performance
                root.game.copyBenchMatrix();
                root.game.nextNodesStack.push([8, 8]);
                //root.game.nextNodesStack.push([Math.floor(Math.random() * root.game.boardSize), Math.floor(Math.random() * root.game.boardSize)]);
                timeout(root.game.runGame);
            }
        }
    }

    function timeout(animate) {
        //requestAnimationFrame(animate);
        setTimeout(animate, 0);
    }

    Game.prototype.checkNeighbors = function (node) {
        var x = node[0]; //represents the x co-ordinate of the player
        var y = node[1]; //represents the y co-ordinate of the player
        //North & West arms exist for the player and the player on it's right resp.
        if (((x + 1) < root.game.boardSize) && (root.game.matrix[x][y].north && root.game.matrix[x + 1][y].west) && !root.game.alreadyInStack(x + 1, y)) {

            root.game.nextNodesStack.push([x + 1, y]);
            root.game.gameScore++;
            root.game.clapSound.play();
        }
        //East & North arms exist for the player and the player below it resp.  
        if (((y + 1) < root.game.boardSize) && (root.game.matrix[x][y].east && root.game.matrix[x][y + 1].north) && !root.game.alreadyInStack(x, y + 1)) {
            root.game.nextNodesStack.push([x, y + 1]);
            root.game.gameScore++;
            root.game.clapSound.play();
        }
        //South & East arms exist for the player and the player on it's left resp.
        if (((x - 1) >= 0) && (root.game.matrix[x][y].south && root.game.matrix[x - 1][y].east) && !root.game.alreadyInStack(x - 1, y)) {
            root.game.nextNodesStack.push([x - 1, y]);
            root.game.gameScore++;
            root.game.clapSound.play();
        }
        //West & South arms exist on the element and element above it resp.  
        if (((y - 1) >= 0) && (root.game.matrix[x][y].west && root.game.matrix[x][y - 1].south) && !root.game.alreadyInStack(x, y - 1)) {
            root.game.nextNodesStack.push([x, y - 1]);
            root.game.gameScore++;
            root.game.clapSound.play();
        }
        if ((root.game.gameScore % (root.game.boardSize * 4)) === 0)
            root.game.yeahSound.play();

        if ((root.game.gameScore % 100) === 0)
            root.game.highFiveYeahSound.play();
    }

    Game.prototype.alreadyInStack = function (x, y) {
        // Check if a neighbor is already in stack
        var present = false;
        this.nextNodesStack.forEach(function (node) {
            if ((node[0] == x) && (node[1] == y))
                present = true;
        });
        return present;
    }

    Game.prototype.rotate = function (node) {
        //Generate the data for 90 degree shifts and add it to tmpMatrix
        var x = node[0];
        var y = node[1];
        if (root.game.matrix[x][y]["north"] && root.game.matrix[x][y]["east"]) {
            // If player is currently facing NE, new position should be ES
            root.game.tmpMatrix.push([x, y, "ES", 1]);
        } else if (root.game.matrix[x][y]["east"] && root.game.matrix[x][y]["south"]) {
            // If player is currently facing ES, new position should be SW
            root.game.tmpMatrix.push([x, y, "SW", 1]);
        } else if (root.game.matrix[x][y]["south"] && root.game.matrix[x][y]["west"]) {
            // If player is currently facing SW, new position should be WN
            root.game.tmpMatrix.push([x, y, "WN", 1]);
        } else if (root.game.matrix[x][y]["west"] && root.game.matrix[x][y]["north"]) {
            // If player is currently facing WN, new position should be NE
            root.game.tmpMatrix.push([x, y, "NE", 1]);
        }
    }

    Game.prototype.commitRotation = function () {
        //For each player to be rotated, update the matrix with the updated player
        var node = this.tmpMatrix.pop();
        while (node) {
            if (node[2] == "NE") {
                // Create a player facing NE 
                if (this.matrix[node[0]][node[1]].name == "Jodi") {
                    this.matrix[node[0]][node[1]] = new Jodi(1, 1, 0, 0);
                } else {
                    this.matrix[node[0]][node[1]] = new Mia(1, 1, 0, 0);
                }
            } else if (node[2] == "ES") {
                // Create a player facing ES
                if (this.matrix[node[0]][node[1]].name == "Jodi") {
                    this.matrix[node[0]][node[1]] = new Jodi(0, 1, 1, 0);
                } else {
                    this.matrix[node[0]][node[1]] = new Mia(0, 1, 1, 0);
                }
            } else if (node[2] == "SW") {
                // Create a player facing SW
                if (this.matrix[node[0]][node[1]].name == "Jodi") {
                    this.matrix[node[0]][node[1]] = new Jodi(0, 0, 1, 1);
                } else {
                    this.matrix[node[0]][node[1]] = new Mia(0, 0, 1, 1);
                }
            } else if (node[2] == "WN") {
                // Create a player facing WN
                if (this.matrix[node[0]][node[1]].name == "Jodi") {
                    this.matrix[node[0]][node[1]] = new Jodi(1, 0, 0, 1);
                } else {
                    this.matrix[node[0]][node[1]] = new Mia(1, 0, 0, 1);
                }
            }
            node = this.tmpMatrix.pop();
        }
    }

    Game.prototype.rotateFast = function (node) {
        //Generate the data for 90 degree shifts and add it to tmpMatrix
        var x = node[0];
        var y = node[1];
        if (root.game.matrix[x][y].north && root.game.matrix[x][y].east) {
            // If player is currently facing NE, north should become 0, and south should become 1
            root.game.tmpMatrix.push([x, y, "north", 0]);
            root.game.tmpMatrix.push([x, y, "south", 1]);
        } else if (root.game.matrix[x][y].east && root.game.matrix[x][y].south) {
            // If player is currently facing ES, east should become 0, and west should become 1
            root.game.tmpMatrix.push([x, y, "east", 0]);
            root.game.tmpMatrix.push([x, y, "west", 1]);
        } else if (root.game.matrix[x][y].south && root.game.matrix[x][y].west) {
            // If player is currently facing SW, south should become 0, and north should become 1
            root.game.tmpMatrix.push([x, y, "south", 0]);
            root.game.tmpMatrix.push([x, y, "north", 1]);
        } else if (root.game.matrix[x][y].west && root.game.matrix[x][y].north) {
            // If player is currently facing WN, west should become 0, and east should become 1
            root.game.tmpMatrix.push([x, y, "west", 0]);
            root.game.tmpMatrix.push([x, y, "east", 1]);
        }
    }

    Game.prototype.commitRotationFast = function () {
        //For each player to be rotated, update the direction of the player in the matrix
        var node = this.tmpMatrix.pop();
        while (node) {
            if (node[2] == "north") {
                // Update north property of existing player to 0 or 1
                this.matrix[node[0]][node[1]].north = node[3];
            } else if (node[2] == "east") {
                // Update east property of existing player to 0 or 1
                this.matrix[node[0]][node[1]].east = node[3];
            } else if (node[2] == "south") {
                // Update south property of existing player to 0 or 1
                this.matrix[node[0]][node[1]].south = node[3];
            } else if (node[2] == "west") {
                // Update west property of existing player to 0 or 1
                this.matrix[node[0]][node[1]].west = node[3];
            }
            node = this.tmpMatrix.pop();
        }
    }

    Game.prototype.fireAnimation = function (nodeList) {
        var letter;
        var number;
        var elID;
        var newClass;
        var oldClass;
        var node = nodeList.pop()
        while (node) {

            // Do CSS Animation for all current set of neighbors
            letter = String.fromCharCode(node[1] + 65);
            number = node[0];
            elID = "#" + letter + number;
            var x = $(elID);
            newClass = "";
            oldClass = "";
            if ($(elID).hasClass("imageClass1")) {
                var newClass = "imageClass2";
                var oldClass = "imageClass1";
            }
            else if ($(elID).hasClass("imageClass2")) {
                var newClass = "imageClass3";
                var oldClass = "imageClass2";
            }
            else if ($(elID).hasClass("imageClass3")) {
                var newClass = "imageClass4";
                var oldClass = "imageClass3";
            }
            else if ($(elID).hasClass("imageClass4")) {
                var newClass = "imageClass1";
                var oldClass = "imageClass4";
            }
            $(elID).removeClass(oldClass).addClass(newClass);

            node = nodeList.pop();
        }
        //Update Score and FPS 
        document.getElementById('gScore').innerHTML = this.gameScore;
        if (this.gameScore > this.recordScore) {
            this.recordScore = this.gameScore;
            document.getElementById('rScore').innerHTML = this.recordScore;
        }
        meter.tick();
    }
    root.game = new Game();
})(HighFive);