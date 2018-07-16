# BitFlyerBotStatus

BitFlyerのBot監視用WebApp.

最終的にはBotの操作をこのAppから行いたい。

現状はBitFlyerAPIから各種データを引っ張って表示するだけ。

## TODO
Botアプリとの接続
  - Bot内のストラテジパラメータとチャートデータをDBに保存し解析可能にする
  - BitFlyerAPIで取得できる全取引データを個別で持つことで後から自由に加工/解析可能にする
  - Botの操作パネルを追加する(取引開始/停止/戦略変更/ロスカットシステムON/OFF等)
    - の前にユーザー認証システムが必要
