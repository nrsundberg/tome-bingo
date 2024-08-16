import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { redirect } from "@remix-run/node";

export async function protectRoute(request: Request) {
  const { getPermission } = await getKindeSession(request);
  let adminPermissions = await getPermission("clearAndSelect");

  if (!adminPermissions?.isGranted) {
    throw redirect("/");
  }
  return null;
}

export async function protectToAdminAndGetPermissions(request: Request) {
  const { getPermissions } = await getKindeSession(request);
  let adminPermissions = await getPermissions();

  if (adminPermissions instanceof Array) {
    throw redirect("/");
  } else if (!(adminPermissions.permissions.length > 0)) {
    throw redirect("/");
  }
  return adminPermissions;
}
