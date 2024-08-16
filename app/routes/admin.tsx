import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/node";
import { Form, Link, useFetcher, useLoaderData } from "@remix-run/react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Divider,
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow
} from "@nextui-org/react";
import { prisma } from "~/db.server";
import { Status } from "@prisma/client";
import { protectToAdminAndGetPermissions } from "~/sessions.server";
import { Page } from "~/components/Page";
import { useState } from "react";
import { zfd } from "zod-form-data";
import { jsonWithInfo, jsonWithSuccess, jsonWithWarning } from "remix-toast";
import { MinimalCsvFileChooser } from "~/components/FileChooser";

export async function loader({ request }: LoaderFunctionArgs) {
  return json({
    user: await protectToAdminAndGetPermissions(request),
    student: await prisma.student.findMany(),
    homeRoom: await prisma.teacher.findMany()
  });
}

export const meta: MetaFunction = () => {
  return [
    { title: "Admin Panel" },
    { name: "description", content: "Tome admin panel cars!" }
  ];
};

const schema = zfd.formData({
  action: zfd.text()
});

export async function action({ request }: ActionFunctionArgs) {
  const { action } = schema.parse(await request.formData());

  if (action === "create") {
    const data = [];

    for (let i = 1; i <= 300; i++) {
      data.push({
        spaceNumber: i,
        status: Status.EMPTY
      });
    }

    await prisma.space.deleteMany();
    await prisma.space.createMany({ data });
    return jsonWithSuccess(
      { result: "Created grid" },
      { message: "Created grid" }
    );
  } else if (action === "delete") {
    await prisma.student.deleteMany();
    return jsonWithWarning(
      { result: "Deleted all records" },
      { message: "Deleted all records" }
    );
  } else {
    await prisma.space.updateMany({ data: { status: Status.EMPTY } });
    return jsonWithInfo({ result: "Reset grid" }, { message: "Reset grid!" });
  }
}

export default function () {
  const { user, student, homeRoom } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher({ key: "delete" });
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const deleteStudents = () => {
    deleteFetcher.submit({ action: "delete" }, { method: "post" });
  };
  const onInputChange = (value: string) => {
    setValue(value);
  };

  return (
    <Page>
      <div>
        <Form method="post">
          <div className="flex auto-rows-auto gap-3 py-4 justify-center">
            {user.permissions.includes("create") && (
              <Button
                color="primary"
                type="submit"
                className="max-w-xs"
                value="create"
                name="action"
              >
                Create Grid
              </Button>
            )}
            {user.permissions.includes("clearAndSelect") && (
              <Button
                color="warning"
                className="max-w-xs"
                type="submit"
                value="clear"
                name="action"
              >
                Clear Grid
              </Button>
            )}
          </div>
        </Form>
        <Divider className={"my-3"} />
        <div className="flex gap-2 justify-center">
          <Link to="/create/homeroom">
            <Button color="secondary" name="action">
              Add Homeroom
            </Button>
          </Link>

          <Link to={`/create/student`}>
            <Button
              color="secondary"
              type="submit"
              className="max-w-xs"
              value="create"
              name="action"
            >
              Add Student
            </Button>
          </Link>
        </div>
        <div className="flex gap-2 py-4 justify-center">
          <Autocomplete
            defaultItems={student}
            label="Search student by Space Num"
            className="max-w-xs"
            onInputChange={onInputChange}
          >
            {(student) => (
              <AutocompleteItem key={student.id} value={student.id}>
                {`${student.firstName}-${student.spaceNumber}`}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <Link to={`/edit/student/${value}`}>
            <Button
              color="warning"
              type="submit"
              className="max-w-xs"
              value="create"
              name="action"
              disabled={value === ""}
            >
              Edit Student
            </Button>
          </Link>
        </div>
        <div className="flex gap-2 py-4 justify-center">
          <Autocomplete
            defaultItems={homeRoom}
            label="Search home room"
            className="max-w-xs"
            onInputChange={onInputChange}
          >
            {(homeRoom) => (
              <AutocompleteItem key={homeRoom.id}>
                {`${homeRoom.homeRoom}`}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <Link to={`/edit/homeroom/${value}`}>
            <Button
              color="warning"
              type="submit"
              className="max-w-xs"
              value="create"
              name="action"
              disabled={value === ""}
            >
              Edit Homeroom
            </Button>
          </Link>
        </div>

        <Divider className="my-3" />
        <div className="flex justify-around">
          <fetcher.Form
            encType="multipart/form-data"
            action="/data/students"
            method="post"
          >
            <MinimalCsvFileChooser file={file} setFile={setFile} />
            <Button
              type="submit"
              color="primary"
              isLoading={fetcher.state !== "idle"}
              isDisabled={file === null}
              className="mt-2"
            >
              Create Records
            </Button>
          </fetcher.Form>
          <Button
            color="danger"
            onClick={deleteStudents}
            isLoading={deleteFetcher.state !== "idle"}
            isDisabled={fetcher.state !== "idle" || student.length === 0}
          >
            Delete All Student Records
          </Button>
        </div>
        <Divider className="my-3" />
        <div className="px-[10vw] h-[300px] overflow-auto">
          <Table removeWrapper isCompact isHeaderSticky>
            <TableHeader columns={studentTableColumns}>
              {(column) => (
                <TableColumn key={column.key}>{column.label}</TableColumn>
              )}
            </TableHeader>
            <TableBody items={student}>
              {(item) => (
                <TableRow key={item.id}>
                  {(columnKey) => (
                    <TableCell>{getKeyValue(item, columnKey)}</TableCell>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Page>
  );
}

const studentTableColumns = [
  { key: "firstName", label: "FIRST" },
  { key: "lastName", label: "LAST" },
  { key: "homeRoom", label: "HOMEROOM" },
  { key: "spaceNumber", label: "SPACE NUMBER" }
];
