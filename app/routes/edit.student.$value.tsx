import { Button, Input } from "@nextui-org/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { redirectWithSuccess } from "remix-toast";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.value, "is bad");
  let stringId = params.value.split("-");

  let student = await prisma.student.findMany({
    where: {
      spaceNumber: parseInt(stringId[1]),
      firstName: stringId[0]
    }
  });
  // Return a response
  return { success: true, student: student[0] };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Extract individual fields from formData
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const spaceNumber = parseInt(formData.get("spaceNumber") as string);
  const homeRoom = formData.get("homeRoom") as string;
  const id = formData.get("id") as string;
  let student = await prisma.student.update({
    where: {
      id: parseInt(id)
    },
    data: {
      id: parseInt(id),
      firstName: firstName,
      lastName: lastName,
      spaceNumber: spaceNumber,
      homeRoom: homeRoom
    }
  });
  return redirectWithSuccess("/admin", { message: "Updated student info" });
}
export default function EditStudent() {
  const data = useLoaderData<typeof loader>() as any;
  invariant(data.student, "this is undefined");
  const fetcher = useFetcher();
  const [firstName, setFirstName] = useState(data.student.firstName);
  const [lastName, setLastName] = useState(data.student.lastName);
  const [spaceNumber, setSpaceNumber] = useState(data.student.spaceNumber);
  const [homeRoom, setHomeRoom] = useState(data.student.homeRoom);

  return (
    <fetcher.Form method="post" className="px-[10vw]">
      <div className="flex gap-2">
        <Input
          name="firstName"
          label="Student first name"
          value={firstName}
          onValueChange={setFirstName}
        />
        <Input
          name="lastName"
          label="Student last Name"
          value={lastName}
          onValueChange={setLastName}
        />
      </div>
      <div className="flex gap-2">
        <Input
          className="py-1"
          type="number"
          name="spaceNumber"
          id="spaceNum"
          label="Parking Number"
          value={spaceNumber}
          onValueChange={setSpaceNumber}
        />
        <Input
          name="homeRoom"
          label="Homeroom Number"
          value={homeRoom}
          onValueChange={setHomeRoom}
        />
        <Input name="id" label="Student ID" value={data.student.id} />
      </div>
      <div>
        <Button type="submit" color="primary">
          Edit Student
        </Button>
      </div>
    </fetcher.Form>
  );
}
