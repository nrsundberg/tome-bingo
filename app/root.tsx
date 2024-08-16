import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from "@remix-run/react";
import "./tailwind.css";

import { json, LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import { NextUIProvider } from "@nextui-org/react";
import { getKindeSession } from "@kinde-oss/kinde-remix-sdk";
import { ReactNode, useEffect } from "react";
import { getToast } from "remix-toast";
import { toast as notify, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import toastStyles from "react-toastify/dist/ReactToastify.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
  { rel: "stylesheet", href: toastStyles }
];

export async function loader({ request }: LoaderFunctionArgs) {
  const { toast, headers } = await getToast(request);
  const { getUser, getPermission } = await getKindeSession(request);
  let user = await getUser();
  let adminPermissions = await getPermission("clearAndSelect");

  if (adminPermissions?.isGranted) {
    return json({ user: !!user, permitted: true, toast }, { headers });
  }

  return json({ user: !!user, permitted: false, toast }, { headers });
}

export function Layout({ children }: { children: ReactNode }) {
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    if (data.toast) {
      const { toast } = data;
      notify(toast.message, { type: toast.type });
    }
  }, [data]);

  return (
    <html lang="en" className="dark bg-[#212525]">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ToastContainer />
        <NextUIProvider>
          {children}
          <ScrollRestoration />
          <Scripts />
        </NextUIProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
