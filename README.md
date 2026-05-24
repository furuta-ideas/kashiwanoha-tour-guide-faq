# 柏の葉スマートシティツアー ガイドＦＡＱ

ガイドメンバー向け **現場サポート用 FAQ 検索ツール**。単一HTMLファイルとして配布可能、外部依存はWebフォントのみ（CDN）。

## ファイル構成

| ファイル | 役割 |
| --- | --- |
| `index.html` | **配布物**。単独で動作するアプリ本体（FAQデータベース＋英訳埋め込み済み） |
| `template.html` | HTMLテンプレート。`/*__FAQ_DB__*/`プレースホルダがビルド時に置換 |
| `parse_xlsx.ps1` | Excelファイル（.xlsx）→ 中間JSON（`faq_raw.json`）の変換 |
| `build.ps1` | 中間JSON＋extra_faq.json＋faq_en.json を統合して `index.html` を生成 |
| `faq_raw.json` | Excel由来の中間生成物（IDの基準ファイル、105件） |
| `extra_faq.json` | スクリプトから手作業で抽出した追加Q&A（49件） |
| `faq_en.json` | id-keyedな英訳（154件） |
| `serve.ps1` | ローカル動作確認用の軽量HTTPサーバ |
| `make_placeholder_bg.ps1` | 背景画像プレースホルダ生成スクリプト |
| `assets/bg-pc.jpg` | PC用ログイン背景画像 |
| `assets/bg-mobile.jpg` | モバイル用ログイン背景画像 |
| `.claude/launch.json` | Claude Code preview起動設定 |

## 仕様

| 項目 | 値 |
| --- | --- |
| 初期パスワード | `2026` |
| ロックアウト | 3回連続失敗で30秒間 |
| 言語切替 | 全画面右上 **JP / EN** トグル。初期値は日本語、選択はlocalStorageに保存 |
| 検索アルゴリズム | 全角半角・大文字小文字・カタカナ／ひらがなを正規化 → スコア順（日英両フィールドを同時検索） |
| 表示件数 | 1ページ最大4件、「他の質問を見る」で次ページ |
| 回答表示 | 14pt太字（モバイルでは12pt）、`●` 区切り最大3件 |
| 音声入力 | Web Speech API（日本語） |

### 検索スコア配点

| 一致箇所 | 配点 |
| --- | --- |
| キーワード完全一致 | +10 |
| キーワード部分一致 | +6 |
| 質問本文の部分一致 | +5 |
| 全文一致ブースト（質問本文に検索語そのまま） | +4 |
| タグ（カテゴリー）一致 | +3 |
| 回答本文の部分一致 | +1 |

## Excel更新時の再ビルド手順

1. 最新のFAQ Excelを所定パスに配置
2. PowerShellで以下を実行：
   ```powershell
   # ① Excelを展開し中間JSONを作成
   .\parse_xlsx.ps1 -ExtractDir <展開先> -OutJson .\faq_raw.json
   # ② index.html を生成
   .\build.ps1
   ```

（`parse_xlsx.ps1`は `xlsx → zip → 展開ディレクトリ` の前処理が必要。詳細はスクリプト冒頭のコメント参照）

## 動作確認

```powershell
.\serve.ps1 -Port 8765
# ブラウザで http://localhost:8765/ を開く
```

## 管理者メニュー（パスワード変更）

ログイン画面のタイトルを **5秒長押し** すると管理メニュー（パスワード変更ダイアログ）が開きます。
検索画面右上の `⋮` ボタンからも開けます。

## 対応ブラウザ

- Chrome 90+（推奨：音声入力対応）
- Safari 14+
- Edge 90+
- Firefox（音声入力は非対応の旨が表示されます）
