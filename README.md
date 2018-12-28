# @musicbot 
### ローカルファイルの再生で便利なDiscord用MusicBot
***
## 既知の問題
 - 最初に参加させたチャンネル以外のチャンネルでコマンドを実行すると二重で反応してしまう
 - ALACファイルを再生しようとすると死ぬ
 - コードが汚い

## 導入
### インストール
```
    npm install
    cp config.sample.json config.json
    vim config.json 
```
discordのbot用トークンを取得して記述してください
### データーベースの作成(更新)
```node db_gen.js```
#### データーベースの削除
```echo [] > database.json```
### botの起動
```npm start```

## 使い方
`!join` : 参加しているボイスチャンネルにBotを追加します

（作成中）