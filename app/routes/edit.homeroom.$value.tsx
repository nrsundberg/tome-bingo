import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Input
} from "@nextui-org/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { Trash2Icon } from "lucide-react";
import { jsonWithSuccess, redirectWithSuccess } from "remix-toast";

export async function loader({ request, params }: LoaderFunctionArgs) {
  invariant(params.value, "params undefined");

  let otherStudents = await prisma.student.findMany({
    where: {
      homeRoom: { not: params.value }
    }
  });

  let roomStudents = await prisma.student.findMany({
    where: {
      homeRoom: params.value
    }
  });
  let homeRoom = await prisma.teacher.findMany({
    where: {
      homeRoom: params.value
    }
  });

  // Return a response
  return {
    success: true,
    students: roomStudents,
    otherStudents: otherStudents,
    homeRoom: homeRoom[0]
  };
}
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  // Extract individual fields from formData
  const numStudents = parseInt(formData.get("numStudents") as string);
  const homeRoom = formData.get("homeRoom") as string;
  const remove = formData.get("delete") as string;
  const id = formData.get("id") as string;
  const action = formData.get("action");
  if (remove) {
    await prisma.student.delete({
      where: {
        id: parseInt(remove)
      }
    });
  }
  if (homeRoom) {
    await prisma.teacher.update({
      where: {
        id: parseInt(id)
      },
      data: {
        homeRoom: homeRoom
      }
    });
  }
  if (numStudents) {
    for (let i = 0; i < numStudents; i++) {
      let student = formData.get(`student_${i}`) as string;
      let id = student.split(" ");
      await prisma.student.update({
        where: {
          id: parseInt(id[2])
        },
        data: {
          homeRoom: homeRoom
        }
      });
    }
  }

  if (action) {
    return redirectWithSuccess("/admin", { message: "Updated homeroom" });
  }
  return jsonWithSuccess("Updated homeroom", { message: "Updated homeroom" });
}

export default function TeacherForm() {
  const fetcher = useFetcher();
  const data = useLoaderData<typeof loader>() as any;
  const [numStudents, setNumStudents] = useState(data.students.length);
  const [homeRoom, setHomeRoom] = useState(data.students[0].homeRoom);
  const [numAddedStudent, setNumAddedStudents] = useState(0);

  return (
    <fetcher.Form className="max-w-[51vw] mx-auto" method="post">
      <h1 className="text-xl pb-5">Teacher</h1>
      <input hidden={true} name="id" value={data.homeRoom.id}></input>
      <Input
        disabled
        name={"homeRoom"}
        label="Teacher homeroom"
        value={homeRoom}
        onValueChange={setHomeRoom}
      />
      <h1 className="text-large pb-5">Students</h1>
      <div className="grid gap-2  ">
        {data.students.map(
          (student: {
            id: string | number;
            firstName: string;
            lastName: string;
          }) => (
            <div className="flex gap-2">
              {student.firstName + " " + student.lastName}
              <Button
                size="sm"
                name="delete"
                color="danger"
                value={student.id}
                type="submit"
                isIconOnly
                onClick={() => {
                  data.students.splice();
                }}
              >
                <Trash2Icon size={17} />
              </Button>
            </div>
          )
        )}
      </div>
      <Button
        size="sm"
        color="primary"
        onClick={() => {
          setNumAddedStudents(numAddedStudent + 1);
        }}
      >
        +
      </Button>

      <div className="grid gap-2">
        {[...Array(numAddedStudent).keys()].map((key) => (
          <Autocomplete name={"student_" + key} label="student">
            {data.otherStudents.map(
              (student: {
                id: string | number;
                firstName: string;
                lastName: string;
              }) => (
                <AutocompleteItem key={student.id}>
                  {student.firstName +
                    " " +
                    student.lastName +
                    " " +
                    student.id}
                </AutocompleteItem>
              )
            )}
          </Autocomplete>
        ))}
      </div>
      <input hidden={true} name="numStudents" value={numAddedStudent}></input>

      <div className="pt-10">
        <Button
          isDisabled={false}
          type="submit"
          color="secondary"
          name="action"
          value="done"
        >
          Done Editing
        </Button>
      </div>
    </fetcher.Form>
  );
}
