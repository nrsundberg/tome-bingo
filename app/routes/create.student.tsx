import { Button, Input } from "@nextui-org/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return {
    success: true
  };
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Extract individual fields from formData

  const spaceNum = formData.get("spaceNum") as string;
  const homeRoom = formData.get("homeRoom") as string;
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

  // Return a response
  return { success: true };
}

export default function FamilyForm() {
  const fetcher = useFetcher();
  const [familyName, setfamilyName] = useState("");
  const [numStudents, setNumStudents] = useState("");

  return (
    <fetcher.Form method="post" className="px-[10vw]">
      <div className="flex gap-2">
        <Input name={"studentFirstName_"} label="Student first name" />
        <Input name={"studentLastName_"} label="Student last Name" />
      </div>
      <div className="flex gap-2">
        <Input
          className="py-1"
          type="number"
          name="spaceNum"
          id="spaceNum"
          label="Parking Number"
        />
        <Input
          id="numStudents"
          name="homeRoom"
          label="Homeroom Number"
          value={numStudents}
          onValueChange={setNumStudents}
        />
      </div>
      <div>
        <Button type="submit" color="primary">
          Add Student
        </Button>
      </div>
    </fetcher.Form>
  );
}
