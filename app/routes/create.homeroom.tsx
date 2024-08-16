import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input
} from "@nextui-org/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { prisma } from "~/db.server";
import { protectToAdminAndGetPermissions } from "~/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const allStudents = await prisma.student.findMany();
  return {
    students: allStudents,
    permissions: protectToAdminAndGetPermissions(request)
  };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // Extract individual fields from formData
  const numStudents = parseInt(formData.get("numStudents") as string);
  const homeRoom = formData.get("homeRoom") as string;

  await prisma.teacher.create({
    data: {
      homeRoom: homeRoom
    }
  });
  // Process student information
  for (let i = 0; i < numStudents; i++) {
    const firstName = formData.get(`student_${i}`) as string;
  }
  // Return a response
  return redirect("/admin");
}

export default function TeacherForm() {
  const fetcher = useFetcher();
  const [numStudents, setNumStudents] = useState(1);
  const data = useLoaderData<typeof loader>() as any; // TODO type this lol
  const students = data.students;

  return (
    <fetcher.Form className="max-w-[51vw] mx-auto" method="post">
      <h1 className="text-xl pb-5">Teacher</h1>
      <Input name={"homeRoom"} label="Teacher homeroom" />
      <h1 className="text-large pb-5">Students</h1>
      <div className="pb-4">
        <Button
          color="primary"
          onClick={() => {
            setNumStudents(numStudents + 1);
          }}
        >
          +
        </Button>
        <Button
          onClick={() => {
            numStudents > 0 ? setNumStudents(numStudents - 1) : null;
          }}
        >
          -
        </Button>
      </div>
      <div className="grid gap-2">
        {[...Array(numStudents).keys()].map((key) => (
          <Autocomplete name={"student_" + key} label="student">
            {students.map(
              (student: {
                id: string | number;
                firstName: string;
                lastName: string;
              }) => (
                <AutocompleteItem key={student.id}>
                  {student.firstName + " " + student.lastName}
                </AutocompleteItem>
              )
            )}
          </Autocomplete>
        ))}
      </div>
      <input hidden={true} name="numStudents" value={numStudents}></input>
      <div className="pt-10">
        <Button isDisabled={false} type="submit" color="secondary">
          Add Teacher
        </Button>
      </div>
    </fetcher.Form>
  );
}
