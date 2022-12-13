import { getMissingIds, saveAppInfoIfValid } from "./src/repo.js";

const missingIds = await getMissingIds();
for (let id in missingIds) {
  saveAppInfoIfValid(id);
}
