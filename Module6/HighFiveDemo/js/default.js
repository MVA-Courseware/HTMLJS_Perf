var meter;

$(document).ready(function () {
    HighFive.game.boardSize = parseInt($("#gridSizeSelector").val());
    HighFive.game.initialize();
    HighFive.game.fillDefaultBoard();
    document.getElementById("resetButton").addEventListener("click", reset);

    if ($("#benchmarkBox").attr('checked')) {
        HighFive.game.benchmarkMode = true;
    }
    $("#benchmarkBox").change(function () {
        if ($(this).attr('checked')) {
            HighFive.game.benchmarkMode = true;
        } else {
            HighFive.game.benchmarkMode = false;
        }
    });

    $("#gridSizeSelector").change(function () {
        $('#gameBoard').html('');
        HighFive.game.tmpMatrix = new Array();
        HighFive.game.nextNodesStack = new Array();
        HighFive.game.currentNodesList = new Array();
        HighFive.game.gameInProgress = false;
        HighFive.game.gameScore = 1;
        HighFive.game.boardSize = parseInt($(this).val());

        HighFive.game.initialize();
        HighFive.game.fillDefaultBoard();
        if ($("#benchmarkBox").attr('checked')) {
            HighFive.game.benchmarkMode = true;
        }
    });

    meter = new FPSMeter(document.getElementById('fpsMeterBox'), {
        graph: 1,
        decimals: 0,
        position: 'absolute',
        bottom: '15px',
        left: '25px',
        theme: 'transparent',
        heat: 1
    });
    meter.tickStart();
});

function reset() {
    HighFive.game.alpha = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    var id;
    var bdSize = 26;
    for (r = 0; r < bdSize; r++) {
        for (c = 0; c < bdSize; c++) {
            id = "#" + HighFive.game.alpha[r] + c;
            $(id).remove();
        }
    }
    HighFive.game.boardSize = parseInt($("#gridSizeSelector").val());
    HighFive.game.tmpMatrix = new Array();
    HighFive.game.nextNodesStack = new Array();
    HighFive.game.currentNodesList = new Array();
    HighFive.game.gameInProgress = false;
    HighFive.game.gameScore = 0;
    HighFive.game.initialize();
    HighFive.game.fillDefaultBoard();
    document.getElementById('gScore').innerHTML = "000";
}