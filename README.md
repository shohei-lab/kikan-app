# kikan-app

在庫・受発注管理のミニ基幹システム。Azure VM (IaaS) 上で Node.js + Express + PostgreSQL + nginx により運用されています。

Azureの学習プロジェクトの一環として構築しました。

## スタック

- Node.js / Express / EJS
- PostgreSQL
- nginx (リバースプロキシ)
- systemd (ユーザーサービス)
- GitHub Actions (CI: ビルド確認・npm audit / CD: VMへの自動デプロイ)
- CodeQL / Dependabot (セキュリティスキャン)

## 開発

```bash
npm install
cp .env.example .env  # 値を設定
npm run dev
```
