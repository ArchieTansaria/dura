import { Installation } from '../../models/Installation.model.js'

export const handleInstallationEvent = async ({ payload }: any) => {
  const { action, installation } = payload;

  console.log("Installation event:", action);

  if (action === "created") {
    console.log("Installation created:", installation.id);
  }
  
  if (action !== "deleted") return;

  await Installation.deleteOne({
    installationId: installation.id,
  });

  console.log("Installation deleted:", installation.id);

};