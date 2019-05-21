const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const ytdl = require("ytdl-core");
const mm = require("music-metadata");
const request = require('request');
const ffmpeg = require('fluent-ffmpeg');
//const streamOptions = { seek: 0, volume: 1 };
let database;
const dbfile = 'database.json';
if (!fs.existsSync(dbfile)) {
  console.log("データーベースファイルが見つかりません");
  process.exit();
}
else {
  database = JSON.parse(fs.readFileSync(dbfile, 'utf8'));
}
//const config = require("./config.json");
let config = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
let queue = [];
let dispatcher;
let connect;
let msg;
let broadcast;
let nowchannel;
let isJoindChannnel = false;
//検索結果配列
let search_result = [];
//曲経過時間変数
let timerCount = 0;
//曲経過時間変数用タイマー
let timer;
//ここすきモード
let iskokosukiModeEnabled = false;
//ログイン
client.login(config.token);
//console.log(database);
client.on("message", message => {

  if (!message.guild) return;
  //joinコマンドで通話に参加
  if (message.content === "!join") {
    if (message.member.voiceChannel) {
      nowchannel = message.member.voiceChannel;
      message.member.voiceChannel.join()
        .then(connection => { // Connection is an instance of VoiceConnection
          //console.log(dispatcher);
          isJoindChannnel = true;
          broadcast = client.createVoiceBroadcast();
          bocchi();
          message.reply("はろ～");
          connect = connection;
          msg = message;
          next();

          //console.log(dispatcher);
          dispatcher.setVolume(0.2);
          /*
          dispatcher.on("end", () => {
            //channel.laeve();
            //console.log("end");
          });
          dispatcher.on("debug", (info) => {
            console.log("Debug: " + info);
          });
          */
        })
        .catch(console.log);
    } else {
      message.reply("まず通話に参加してね");
    }
  }
  else if (message.content === "!skip") {
    if (!isJoindChannnel) return;
    /*if (command) {
      command.on('error', function () {
        console.log('Ffmpeg has been killed');
        //setTimeout(next, 500);
      })
      command.kill();
      */
     broadcast.end();
     setTimeout(next,500);
  }
  else if (message.content.startsWith("!search")) {
    let query = message.content.replace("!search ", "");
    let result;
    if (query.startsWith("title")) {
      query = query.replace("title ", "");
      result = database.filter(m => m.title).filter(m => m.title.match(new RegExp(query, "ig")));
    }
    else if (query.startsWith("album")) {
      query = query.replace("album ", "");
      result = database.filter(m => m.album).filter(m => m.album.match(new RegExp(query, "ig")));
    }
    else if (query.startsWith("artist")) {
      query = query.replace("artist ", "");
      result = database.filter(m => m.artist).filter(m => m.artist.match(new RegExp(query, "ig")));
    }
    else {
      message.reply("引数が不正です");
      return;
    }
    let text = "";
    let num = 0;
    result.forEach(element => {
      num++;
      text += "\n[" + num + "]\nタイトル：" + element.title + "\nアーティスト：" + element.artist + "\nアルバム：" + element.album + "\n";
    });
    if (result.length > 30) {
      message.reply("結果が多すぎます");
    }
    else if (result.length === 1) {
      queue.push([result[0], true]);
      //console.log(queue);
      message.reply(result[0].title + "を追加しました");
    }
    else if (result.length === 0) {
      message.reply("結果が見つかりません");
    }
    else {
      if (text.length > 1999) {
        message.channel.send(text.slice(0, 1999));
        message.channel.send(text.slice(2000, text.length));
      }
      else {
        message.reply(text);
      }
      search_result = result;
    }
  }
  else if (message.content.startsWith("!play")) {
    let query = message.content.replace("!play ", "");
    if (query.match(new RegExp(/https?.*/, "ig"))) {
      if (query.startsWith("https://www.youtube.com/watch") || query.startsWith("https://youtu.be/") || query.match(new RegExp(/https?.*(mp3|flac|wav|m4a|opus|ogg)$/, "ig"))) {
        queue.push([query, false]);
        message.reply("追加しました");
      }
      else {
        message.reply("URLが不正です");
      }
    }
    else {
      if (query.length <= 2) {
        const num = parseInt(query, 10);
        if (num > 0 && num <= search_result.length) {
          queue.push([search_result[num - 1], true]);
          message.reply(search_result[num - 1].title + "を追加しました");
          search_result = [];
          return;
        }
      }
      let result = database.filter(m => m.title).filter(m => m.title.match(new RegExp(query, "ig")));
      if (result.length > 30) {
        message.reply("結果が多すぎます");
      }
      else if (result.length === 0) {
        message.reply("結果が見つかりません");
      }
      else {
        //結果の中からランダムでキューに追加
        const n = Math.floor(Math.random() * result.length);
        queue.push([result[n], true]);
        message.reply(result[n].title + "を追加しました");
        search_result = [];
      }
    }
  }
  else if (message.content.startsWith("!queue remove")) {
    let query = message.content.replace("!queue remove ", "");
    if (query === "all") {
      queue = [queue[0]];
      message.reply("キューを全削除しました");
    }
    else {
      const num = parseInt(query, 10);
      if (num !== 0 && num <= queue.length) {
        let displayname;
        if (typeof queue[num][0] === "object") {
          displayname = queue[num][0].title;
        }
        else {
          displayname = queue[num][0];
        }
        message.reply(displayname + "を削除しました");
        queue.splice(num, 1);
      }
    }
  }
  else if (message.content.startsWith("!queue")) {
    let num = 0;
    let text = "";
    queue.forEach(element => {
      let displayname;
      if (typeof element[0] === "object") {
        displayname = element[0].title + "/" + element[0].artist;
      }
      else {
        displayname = element[0];
      }
      text += "\n `[" + num + "]" + displayname + "`";
      num++;
    });
    message.reply(text);
  }
  else if (message.content.startsWith("!nowplay") || message.content.startsWith("!np")) {
    //チャンネルに参加してない場合はリターン
    if (!isJoindChannnel) return;
    if (queue[0][1]) {
      mm.parseFile(config.directory + queue[0][0].file, {}).then((metadata) => {
        let img = {};
        if (metadata.common.picture) {
          img = { file: metadata.common.picture[0].data };
        }
        let kokosuki_time_text = "";
        if (queue[0][0].kokosukiTimes.length === 0) {
          kokosuki_time_text = "なし";
        }
        else {
          queue[0][0].kokosukiTimes.forEach(element => {
            kokosuki_time_text += `${element / 10}秒頃, `;
          });
        }
        message.reply(`タイトル：${metadata.common.title}\nアルバム：${metadata.common.album}\nアーティスト：${metadata.common.artist}\nここすき：${kokosuki_time_text}`, img);
      });
    }
    else {
      message.reply("`URL:" + queue[0][0] + "`");
    }
  }
  else if (message.content.startsWith("!rks") || message.content.startsWith("!recodekokosuki")) {
    if (queue[0][1]) {
      //カウンターの値と記録値が近似している場合を判定して重複を排除
      //console.log(queue[0][0].kokosukiTimes);
      //console.log(timerCount);
      //現在より３秒以内にここすきされている場合配列を返す
      const kokosuki_kaburi = queue[0][0].kokosukiTimes.filter(w => Math.abs(timerCount - w) < 30);
      if (kokosuki_kaburi.length === 0) {
        //console.log(timerCount);
        //同時投稿で被らないようにキュー上のDBにも記録
        queue[0][0].kokosukiTimes.push(timerCount);
        //二回再生目で被らないようにローカルDBに記録
        database[database.findIndex(({ file }) => file === queue[0][0].file)] = queue[0][0];
        //console.log(database[database.findIndex(({file}) => file === queue[0][0].file)]);
        //DBに書き出し
        fs.writeFile(dbfile, JSON.stringify(database));
        //登録完了を返信
        message.reply("ここすきを登録しました");
      }
      else {
        message.reply("そのここすきは二番煎じだ！");
      }
    }
    else {
      message.reply("この機能はローカルの音楽ファイルのみに適用可能です");
    }
  }
  else if (message.content.startsWith("!togglekokosukimode") || message.content.startsWith("!tkm")) {
    iskokosukiModeEnabled = !iskokosukiModeEnabled;
    message.reply(`ここすきモードを${iskokosukiModeEnabled ? "オン" : "オフ"}にしました`);
  }
  else if (message.content.startsWith("!help")) {
    message.reply("使い方\n`!join` : Botを通話に追加します\n`!search (title|album|artist) string` : ローカルの音楽ファイルから検索を行います\n`!play number` : 検索結果の中から指定番号のファイルをキューに追加します\n`!play string` : ローカルの音楽ファイルから検索を行い最初にヒットした曲をキューに追加します\n`!play (youtube_url|file_url)` : Youtubeの動画またはリモート音楽ファイルをキューに追加します。対応形式はmp3,flac,wav,m4a(AAC),opus,oggです。\n`!skip` : 現在再生中のファイルをスキップします\n`!nowplay (!np)` : 現在再生中の音楽の詳細を表示します\n`!queue` : キューを表示します\n`!queue remove number` : キューから指定した曲を削除します\n`!queue remove all` : キューをリセットします\n`!recodekokosuki (!rks)` : ここすきを記録します(ここすきしたいタイミングで実行してください)\n`!togglekokosukimode (!tkm)` : ここすきがある曲のみを再生するモードをオン(オフ)にします\n`!help` : このヘルプを表示します");
  }
  else if (message.content.startsWith("!disconnect")||message.content.startsWith("!quit")) {
    exit();
  }
});
let flag = false;
//let i = 0;
let timeout;
function play() {
  if (!isJoindChannnel) return;
  if (queue[0][1]) {
    let file = fs.createReadStream(config.directory + queue[0][0].file);
    let command = ffmpeg(file).audioCodec("pcm_s16le").noVideo().format('wav');
    let stream = command.pipe();
    //stream.on("data", (data) => { console.log(data) });
    broadcast.playStream(stream);
    stream.on("end", () => {
      console.log("end");
      //setTimeout(next,500);
    });
    mm.parseFile(config.directory + queue[0][0].file, {}).then((metadata) => {
      /*let img={};
      if(metadata.common.picture){
        img =  { file: metadata.common.picture[0].data };
      }
      msg.channel.send(`タイトル：${metadata.common.title}\nアルバム：${metadata.common.album}\nアーティスト：${metadata.common.artist}`, img);*/
      //終了時間を設定
      const endtime = Math.floor(metadata.format.duration * 1000) + 5000;
      timeout = setTimeout(next, endtime);
    });
  }
  else {
    //i++;
    //msg.channel.send("再生："+queue[0][0]);
    if (queue[0][0].startsWith("https://www.youtube.com/watch") || queue[0][0].startsWith("https://youtu.be/")) {
      ytdl.getInfo(queue[0][0], {}, (err, info) => {
        const form = (info.formats.filter(f => f.type == 'audio/webm; codecs="opus"'));
        let command = ffmpeg(ytdl(queue[0][0], { format: form[0] })).audioCodec("pcm_s16le").noVideo().format('wav');
        let stream = command.pipe();
        broadcast.playStream(stream);
        stream.on("end", () => {
          console.log("end");
          setTimeout(next, 10000);
        });
      });
    }
    else {
      let stream = request(queue[0][0]);
      broadcast.playStream(stream);
      stream.on("end", () => {
        console.log("end");
        setTimeout(next, 10000);
      });
    }
  }
  //曲初回再生判定
  if (!flag) {
    //曲の経過時間は0.1秒単位で記録する
    timer = setInterval(count, 100);
    dispatcher = connect.playBroadcast(broadcast);
    flag = true;
  }
  //console.log(dispatcher);
}
function next() {
  clearTimeout(timeout);
  //broadcast.destroy();
  //経過時間リセット
  timerCount = 0;
  //console.log(dispatcher);
  /*if(dispatcher) {
    dispatcher.end();
    dispatcher=null;
  }*/
  queue.shift();
  if (queue.length === 0) {
    let music;
    if (iskokosukiModeEnabled) {
      const tmpDatabaseAry = database.filter(m => m.kokosukiTimes.length > 0);
      music = tmpDatabaseAry[Math.floor(Math.random() * tmpDatabaseAry.length)];
    }
    else {
      music = database[Math.floor(Math.random() * database.length)];
    }
    queue.push([music, true]);
  }
  //console.log(queue[0]);
  play();
}
function bocchi() {
  if (isJoindChannnel) {
    //console.log(nowchannel.members.size);
    setTimeout(bocchi, 50000);
    if (nowchannel.members.size == 1) {
      exit();
    }
  }
}
function exit() {
  dispatcher = null;
  broadcast.end();
  broadcast = null;
  nowchannel.connection.disconnect();
  nowchannel.leave();
  isJoindChannnel = false;
  flag = false;
  clearInterval(timer);
}
//タイマーカウント関数
function count() {
  timerCount++;
  //ローカルファイルのみ判定を行う
  if (queue[0][1]) {
    const kokosuki_ary = queue[0][0].kokosukiTimes;
    for (let i in kokosuki_ary) {
      //5秒前予告
      const n = Number(i) + 1;
      if ((kokosuki_ary[i] - 50) === timerCount) {
        msg.channel.send(`:warning: ここすき注意 :warning: (${n}/${kokosuki_ary.length}回目)`);
      }
      else if ((kokosuki_ary[i] - 5) === timerCount) {
        msg.channel.send(`ここすき！ (${n}/${kokosuki_ary.length}回目)`);
      }
    }
  }
}
//client.on('debug', console.log)