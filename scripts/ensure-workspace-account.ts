import { ensureDefaultWorkspaceAccount } from "../src/lib/ensure-default-account";

async function main() {
  const result = await ensureDefaultWorkspaceAccount();
  if (result.created) {
    console.log(`Created default login account: ${result.username} (${result.email})`);
    return;
  }
  if (result.syncedPassword) {
    console.log(`Synced default login password for ${result.username} (${result.email})`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
