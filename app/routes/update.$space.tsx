import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import { Status } from "@prisma/client";

export async function action({ params }: ActionFunctionArgs) {
  const { space } = params;
  if (space === undefined) {
    redirect("/");
  } else {
    const spaceNumber = parseInt(space);
    return prisma.space.update({
      where: { id: spaceNumber },
      data: {
        status: Status.ACTIVE,
        timestamp: new Date().toLocaleString()
      }
    });
  }
}
