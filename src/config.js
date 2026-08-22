const { DefaultAzureCredential } = require('@azure/identity');
const { SecretClient } = require('@azure/keyvault-secrets');

async function loadConfig() {
  const vaultUrl = process.env.AZURE_KEY_VAULT_URL;

  if (!vaultUrl) {
    return {
      databaseUrl: process.env.DATABASE_URL,
      sessionSecret: process.env.SESSION_SECRET,
      adminUsername: process.env.ADMIN_USERNAME,
      adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
      port: process.env.PORT || 3000,
    };
  }

  const credential = new DefaultAzureCredential();
  const client = new SecretClient(vaultUrl, credential);

  const [databaseUrl, sessionSecret, adminUsername, adminPasswordHash] = await Promise.all([
    client.getSecret('database-url'),
    client.getSecret('session-secret'),
    client.getSecret('admin-username'),
    client.getSecret('admin-password-hash'),
  ]);

  return {
    databaseUrl: databaseUrl.value,
    sessionSecret: sessionSecret.value,
    adminUsername: adminUsername.value,
    adminPasswordHash: adminPasswordHash.value,
    port: process.env.PORT || 3000,
  };
}

module.exports = loadConfig;
