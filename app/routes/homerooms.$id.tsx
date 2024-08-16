import { Status } from "@prisma/client";
import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  invariant(params.id, "params.teacherId is required");
  const teacher = await prisma.teacher.findUnique({
    where: { id: parseInt(params.id) }
  });

  const students = await prisma.student.findMany({
    where: { homeRoom: teacher?.homeRoom },
    select: { firstName: true, lastName: true, spaceNumber: true }
  });

  interface Student {
    firstName: string;
    lastName: string;
    spaceNumber: number | null;
    status: Status;
  }

  const studentReturn: Student[] = [];

  for (let student of students) {
    let spaceStatus = await prisma.space.findUnique({
      where: { spaceNumber: student.spaceNumber ?? 0 },
      select: { status: true }
    });
    let currentStudent = {
      firstName: student.firstName,
      lastName: student.lastName,
      spaceNumber: student.spaceNumber,
      status: spaceStatus ? spaceStatus.status : Status.EMPTY
    };
    studentReturn.push(currentStudent);
  }

  return studentReturn;
}

export default function StudentList() {
  const students = useLoaderData<typeof loader>();

  return (
    <div>
      <div className="text-xl">{}</div>
      <div className="grid grid-cols-5 lg:grid-cols-10 auto-rows-fr h-fit">
        {students.map((student) => (
          <div
            className={
              "h-28 p-2 border border-white text-center " +
              (student.status === Status.ACTIVE
                ? "bg-green-700"
                : "bg-gray-700")
            }
          >
            <div className="text-lg">
              {student.firstName + " " + student.lastName}
            </div>
            <div>{"Space " + student.spaceNumber}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
