# class-slackbot
Google Apps Script (GAS) で動く，クラスSlackのbot

## Setup
[gas-clasp-starter](https://github.com/pizzacat83/gas-clasp-starter#getting-started)のセットアップをする（test環境が不要であれば，その項はスキップ可）

GASのスクリプトのプロパティに以下を設定する

- `slack-bot-token`: botトークン
- `slack-user-token`: 全ユーザのメッセージ削除のための管理者のトークン
- `seashore-id`: 定期的にメッセージ削除するSlackのチャンネルのID
- `root-folder-id`: 更新通知対象のフォルダ
- `drivelog-id`: 更新通知するSlackのチャンネルID
- `ignored-drive-items`: 更新通知されたくないフォルダやファイルのIDのリストのJSON

```bash
./deploy.release.sh
```

## Licenses
MIT License

このリポジトリは以下のプロジェクトを利用しています。

### gas-clasp-starter
Copyright (c) 2018 Tatsuya Nakano
Released under the [MIT license](https://github.com/howdy39/gas-clasp-starter/blob/master/LICENSE.txt)