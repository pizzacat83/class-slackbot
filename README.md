# class-slackbot
Google Apps Script (GAS) で動く，クラスSlackのbot

## Setup
### デプロイ設定
[gas-clasp-starter](https://github.com/pizzacat83/gas-clasp-starter#getting-started)のセットアップをする（test環境が不要であれば，その項はスキップ可）

### Trello連携設定

#### Slackと連携するチームがまだなければ作成

#### SlackにTrelloをインストール

#### ドライブ管理に使うボードを作成
- チームメンバーが参加できるようにする: オフ
- コメントの許可設定: チームメンバー

にしておくと管理者以外のチームメンバーは閲覧とコメント権限のみ持つ。

#### ドライブ管理ボードと連携するSlackチャンネルを作成
```
/invite @trello
/trello ボードのURL
```

### GASのスクリプトのプロパティ設定

- `slack-bot-token`: botトークン
- `slack-user-token`: 全ユーザのメッセージ削除のための管理者のトークン
- `seashore-id`: 定期的にメッセージ削除するSlackのチャンネルのID
- `root-folder-id`: 更新通知対象のフォルダ
- `drivelog-id`: 更新通知するSlackのチャンネルID
- `drivelog-admin-id`: Trelloと連携するSlackのチャンネルID
- `ignored-drive-items`: 更新通知されたくないフォルダやファイルのIDのリストのJSON
- `trello-token`, `trello-key`: TrelloのAPIトークンとキー
- `trello-drive-board-id`: ドライブ管理に使うTrelloボードID

```bash
./deploy.release.sh
```

## Licenses
MIT License

このリポジトリは以下のプロジェクトを利用しています。

### gas-clasp-starter
Copyright (c) 2018 Tatsuya Nakano
Released under the [MIT license](https://github.com/howdy39/gas-clasp-starter/blob/master/LICENSE.txt)