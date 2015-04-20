// サーバー構築
var http = require("http");
// fsモジュールの読み込み
var fs = require("fs");
// pathモジュールの読み込み
var path = require("path");
// httpサーバーを立てる
var server = http.createServer(function(req, res) {
    res.writeHead(200, {"Content-Type":"text/html"});
    var output = fs.readFileSync("./index.html", "utf-8");
    res.end(output);
});

// httpサーバーを起動する。
server.listen((process.env.PORT || 5000), function() {
    console.log((process.env.PORT || 5000) + "でサーバーが起動しました");
});


// socket.ioの読み込み
var socket = require("socket.io");
// サーバーでSocket.IOを使える状態にする
var io = socket.listen(server);

/*
io.configure('production', function(){
  io.set('transports', [
    'websocket',
    'htmlfile',
    'xhr-polling'
  ]);
});
*/
var userHash = {};
io.sockets.on("connection", function (sock) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
  sock.on("join", function (name) {
    var msg = name + "さんが入室しました";
    userHash[sock.id] = name;
    io.sockets.emit("publish", {value: msg});
  });

  // メッセージ送信カスタムイベント
  sock.on("publish", function (data) {
    io.sockets.emit("publish", {value:data.value});
  });

  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  sock.on("disconnect", function () {
    if (userHash[sock.id]) {
      var msg = userHash[sock.id] + "さんが退出しました";
      delete userHash[sock.id];
      io.sockets.emit("publish", {value: msg});
    }
  });

  // メッセージ送信カスタムイベント
  sock.on("published", function (data) {
    data.datetime = new Date();
   io.sockets.emit("published", data);
  });


});
