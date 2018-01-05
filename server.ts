// express und http Module importieren. Sie sind dazu da, die HTML-Dateien
// aus dem Ordner "public" zu veröffentlichen.
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = 65500;

// Mit diesem Kommando starten wir den Webserver.
server.listen(port, function () {
    // Wir geben einen Hinweis aus, dass der Webserer läuft.
    console.log('Webserver läuft und hört auf Port %d', port);
});

// Hier teilen wir express mit, dass die öffentlichen HTML-Dateien
// im Ordner "public" zu finden sind.
app.use(express.static(__dirname + '/client'));