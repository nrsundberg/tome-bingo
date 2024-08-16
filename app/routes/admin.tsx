import {
  ActionFunctionArgs,
  json,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/node";
import {
  Form,
  Link,
  Outlet,
  useFetcher,
  useLoaderData
} from "@remix-run/react";
import {
  Autocomplete,
  AutocompleteItem,
  Button,
  Divider,
  getKeyValue,
  Input,
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
    data: await prisma.student.findMany()
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
  const { user, data } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const deleteFetcher = useFetcher({ key: "delete" });
  const [value, setValue] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const deleteStudents = () => {
    deleteFetcher.submit({ action: "delete" }, { method: "post" });
  };

  return (
    <Page>
      <Form method="post">
        <div className="grid auto-rows-auto gap-3 py-4 justify-center">
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
        </div>
      </Form>
      <div className="grid auto-rows-auto gap-3 py-4 justify-center">
        <Link to="./create/teacher">
          <Button color="primary" name="action">
            Add Teacher
          </Button>
        </Link>
        <div className="flex">
          <Autocomplete
            defaultItems={data}
            label="Search student"
            className="max-w-xs"
          >
            {(student) => (
              <AutocompleteItem
                key={student.firstName}
                value={student.firstName}
              >
                {student.firstName}
              </AutocompleteItem>
            )}
          </Autocomplete>
          <Link to={`./edit/student/${value}`}>
            <Button
              color="primary"
              type="submit"
              className="max-w-xs"
              value="create"
              name="action"
            >
              Edit Student
            </Button>
          </Link>
        </div>
      </div>
      <Outlet></Outlet>
      <Divider className="my-3" />
      <FamilyForm />
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
          isDisabled={fetcher.state !== "idle" || data.length === 0}
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
          <TableBody items={data}>
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
    </Page>
  );
}

export function FamilyForm() {
  const fetcher = useFetcher();
  const [familyName, setfamilyName] = useState("");
  const [numStudents, setNumStudents] = useState("");
  const [students, setStudents] = useState([]);

  return (
    <fetcher.Form method="post" action="./create/student" className="px-[10vw]">
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

const studentTableColumns = [
  { key: "firstName", label: "FIRST" },
  { key: "lastName", label: "LAST" },
  { key: "homeRoom", label: "HOMEROOM" },
  { key: "spaceNumber", label: "SPACE NUMBER" }
];
