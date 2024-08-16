import { LoaderFunctionArgs } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData, useOutlet } from "@remix-run/react";
import { Page } from "~/components/Page";
import { prisma } from "~/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  return await prisma.teacher.findMany();
}

export default function TeacherList() {
  const teachers = useLoaderData<typeof loader>();
  const outlet = useOutlet();

  return (
    <Page>
      <div className="flex pt-3 divide-x-2">
        <div className="pl-5 pr-10">
          <h1 className="text-xl font-bold">Homerooms</h1>
          {teachers.map((teacher) => (
            <div>
              <NavLink
                to={`./${teacher.id}`}
                className={({ isActive }) =>
                  "text-lg" + (isActive ? " text-primary-600 font-bold" : "")
                }
              >
                {teacher.homeRoom}
              </NavLink>
            </div>
          ))}
        </div>
        {!outlet && <div />}
        <Outlet />
      </div>
    </Page>
  );
}
