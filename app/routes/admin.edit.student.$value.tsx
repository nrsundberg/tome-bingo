import { ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "~/db.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Extract individual fields from formData

  const spaceNum = formData.get("spaceNum") as string;
  const homeRoom = formData.get("homeRoom");
  console.log(homeRoom);
  const firstName = formData.get(`studentFirstName_`) as string;
  const lastName = formData.get(`studentLastName_`) as string;

  const space = await prisma.space.findUnique({
    where: {
      spaceNumber: parseInt(spaceNum)
    }
  });

  let student = await prisma.student.create({
    data: {
      firstName: firstName,
      lastName: lastName,
      spaceNumber: space?.spaceNumber,
      homeRoom: homeRoom
    }
  });

  console.log("student created", student);
  // Return a response
  return { success: true };
}
