import { Link, useRouteLoaderData } from "@remix-run/react";
import { loader } from "~/root";
import logo from "/favicon.ico?url";

export default function () {
  const data = useRouteLoaderData<typeof loader>("root");

  return data?.user ? (
    <div className="h-10 w-full bg-blue-300 flex items-center justify-center">
      <Link to="/" className="text-black font-bold inline-flex items-center">
        <img src={logo} alt={"school logo"} height={40} width={40} />
        Tome School - Car Line Bingo
      </Link>
      <div className="inline-flex gap-2  absolute right-2">
        <Link
          className="border-1 border-black p-1 rounded-lg text-black"
          to="/admin"
        >
          Admin
        </Link>
        <Link
          className="border-1 border-black p-1 rounded-lg text-black"
          to="/kinde-auth/logout"
        >
          Logout
        </Link>
      </div>
    </div>
  ) : (
    <div className="h-10 w-full bg-blue-300 flex items-center justify-center">
      <Link to="/" className="text-black font-bold inline-flex items-center">
        <img src={logo} alt={"school logo"} height={40} width={40} />
        Tome School - Car Line Bingo
      </Link>
      <Link
        className="border-1 border-black p-1 rounded-lg absolute right-2 text-black"
        to="/kinde-auth/login?returnTo=/create/user"
      >
        Login
      </Link>
    </div>
  );
}
