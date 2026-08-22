# kikan-app

在庫・受発注管理のミニ基幹システム。Azure VM (IaaS) 上で Node.js + Express + PostgreSQL + nginx により運用されています。

Azureの学習プロジェクトの一環として構築しました。

## スタック

- Node.js / Express / EJS
- PostgreSQL
- nginx (リバースプロキシ)
- systemd (ユーザーサービス)
- GitHub Actions (CI: ビルド確認・npm audit / CD: VMへの自動デプロイ、セルフホストランナー使用)
- CodeQL / Dependabot (セキュリティスキャン)
- Azure Key Vault + Managed Identity (秘密情報管理、本番環境)
- Azure Backup (VM単位の日次バックアップ)
- Azure Cost Management (月次予算アラート)

## 秘密情報の管理

- **ローカル開発**: `.env` に直接設定(`.env.example` 参照)
- **本番(VM)**: `AZURE_KEY_VAULT_URL` を設定すると、DB接続情報・セッションシークレット・管理者認証情報を
  Azure Key Vault から VM の Managed Identity 経由で取得する(`.env` に平文の秘密情報を置く必要がない)

## 開発

```bash
npm install
cp .env.example .env  # 値を設定
npm run dev
```

## fork/セルフホストする場合の注意

`.github/workflows/deploy.yml` の CD ジョブは、このリポジトリ用に用意した VM 上のセルフホストランナー
(`self-hosted`, `kikan-vm` ラベル)を前提にしています。fork した場合、アプリのコード自体は問題なく動きますが、
自動デプロイを動かすには自分の環境に合わせてワークフローを書き換えるか、ランナーを別途用意してください。

## License

MIT License. 詳細は [LICENSE](./LICENSE) を参照してください。
