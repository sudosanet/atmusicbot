# @musicbot 
### ローカルファイルの再生で便利なDiscord用MusicBot
***
## 既知の問題
 - 最初に参加させたチャンネル以外のチャンネルでコマンドを実行すると二重で反応してしまう
 - コードが汚い

## 導入
### インストール
```
    npm install
    cp config.sample.json config.json
    vim config.json 
```
discordのbot用トークンを取得して記述してください
### データーベースの作成（更新）
```node db_gen.js```
#### データーベースの削除
```echo [] > database.json```
### botの起動
```npm start```

## 使い方
`!join` : Botを通話に追加します 
`!search (title|album|artist) string` : ローカルの音楽ファイルから検索を行います 
`!play number` : 検索結果の中から指定番号のファイルをキューに追加します 
`!play string` : ローカルの音楽ファイルから検索を行い最初にヒットした曲をキューに追加します 
`!play (youtube_url|file_url)` : YouTubeの動画またはリモート音楽ファイルをキューに追加します。 
`!skip` : 現在再生中のファイルをスキップします 
`!nowplay (!np)` : 現在再生中の音楽の詳細を表示します 
`!queue` : キューを表示します 
`!queue remove number` : キューから指定した曲を削除します 
`!queue remove all` : キューをリセットします 
`!recodekokosuki (!rks)` : ここすきを記録します（ここすきしたいタイミングで実行してください） 
`!togglekokosukimode (!tkm)` : ここすきがある曲のみを再生するモードをオン（オフ）にします 
`!disconnect (!quit)` : botを切断します 
`!help` : このヘルプを表示します"); 
 
（作成中）