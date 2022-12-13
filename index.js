import { getMissingIds, saveAppInfoIfValid } from "./src/repo.js";

const missingIds = await getMissingIds();
for (let index in missingIds) {
  let id = missingIds[index];
  let countString = `${index}/${missingIds.length} - ${id} - `;
  saveAppInfoIfValid(id, countString);
}
