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
  sock.on("publish", function (data) {
    data.time = new Date().getTime();
    switch(data.type)
    {
        case 'join':
            data.value = data.name + "入室しました。";
            break;
        case 'defect':
            data.value = data.name + "退室しました。";
            break;
    }
    io.sockets.emit("message", data);
  });

  sock.on('disconnect', function(data) {
    var data = {};
    data.type = 'defect';
    data.time = new Date().getTime();
    if (userHash[sock.id]) {
      data.name = userHash[sock.id];
      data.value = userHash[sock.id] + "退室しました";
      delete userHash[sock.id];
      io.sockets.emit("message", data);
    }
  });
});
