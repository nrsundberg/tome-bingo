import { LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Skeleton } from "@nextui-org/react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { prisma } from "~/db.server";
import { Page } from "~/components/Page";

export const meta: MetaFunction = () => {
  return [
    { title: "Create User - Jimbot" },
    { name: "description", content: "Creating User" }
  ];
};

//creates a user or checks if user already exists
export async function loader({ request }: LoaderFunctionArgs) {
  let { getUser } = await getKindeSession(request);
  let user = await getUser();
  let userId = user?.id;

  if (userId === undefined) {
    throw redirect("/login");
  }

  const userExistsInDb = await prisma.user.findUnique({
    where: { kindeId: userId }
  });

  if (!userExistsInDb) {
    await prisma.user.create({
      data: {
        kindeId: userId
      }
    });
    throw redirect("/");
  }
  throw redirect("/");
}

export default function CreateUser() {
  const errors = useLoaderData<typeof loader>();
  return errors ? (
    <div className="flex items-center space-x-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  ) : (
    <Page>
      <h1>{errors}</h1>
    </Page>
  );
}
