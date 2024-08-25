import { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Page } from "~/components/Page";
import { prisma } from "~/db.server";
import {
  useFetcher,
  useLoaderData,
  useRevalidator,
  useRouteLoaderData,
  useSearchParams
} from "@remix-run/react";
import { Space, Status } from "@prisma/client";
import { loader as rootLoader } from "~/root";
import {
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectItem,
  SharedSelection
} from "@nextui-org/react";
import { useEffect, useState } from "react";
import { SendFilledIcon } from "@nextui-org/shared-icons";

export const meta: MetaFunction = () => {
  return [
    { title: "Tome Car Bingo" },
    { name: "description", content: "Tome School car line!" }
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const filterRooms = new URL(request.url).searchParams.get("room");
  const roomFilter = () => {
    if (filterRooms) {
      return { homeRoom: { in: filterRooms.split(",") } };
    }
    return {};
  };

  return {
    spaces: await prisma.space.findMany({ orderBy: { spaceNumber: "asc" } }),
    homeRooms: await prisma.teacher.findMany(),

    recentCars: await prisma.student.findMany({
      where: {
        homeRoom: { in: filterRooms?.split(",") },
        space: { status: Status.ACTIVE }
      },
      orderBy: {
        space: {
          timestamp: "desc"
        }
      },
      take: 20
    })
  };
}

export const useRevalidateOnInterval = ({
  enabled = false,
  interval = 1000
}: {
  enabled?: boolean;
  interval?: number;
}) => {
  let revalidate = useRevalidator();
  useEffect(
    function revalidateOnInterval() {
      if (!enabled) return;
      let intervalId = setInterval(revalidate.revalidate, interval);
      return () => clearInterval(intervalId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [revalidate]
  );
};

export default function () {
  const [searchParams, setSearchParams] = useSearchParams();
  const { spaces, homeRooms, recentCars } = useLoaderData<typeof loader>();
  const data = useRouteLoaderData<typeof rootLoader>("root");
  useRevalidateOnInterval({
    enabled: true,
    interval: 3 * 1001
  });

  const updateUrl = (key: SharedSelection) => {
    // @ts-ignore
    const rooms = Array.from(key.keys()).join(",");
    setSearchParams((prev) => {
      rooms === "" ? prev.delete("room") : prev.set("room", rooms);
      return prev;
    });
  };

  const defaultFilter = searchParams!.get("room")?.split(",");

  return (
    <Page>
      <div className="flex justify-center">
        <div
          className={`grid ${data?.permitted ? "grid-rows-30" : "grid-rows-20"} h-[90vh] w-5/6 font-extrabold text-large text-center`}
        >
          <ParkingRows data={spaces} cols={data?.permitted ? 10 : 15} />
        </div>
        {!data?.permitted && (
          <div className="grid-rows-40 gap-3 py-2 text-center h-[80vh]">
            <Select
              label="Filter Homeroom"
              defaultSelectedKeys={defaultFilter}
              placeholder="Select Homeroom(s)"
              className="max-w-xs px-4 pt-4"
              variant="bordered"
              selectionMode="multiple"
              onSelectionChange={updateUrl}
            >
              {homeRooms.length === 0 ? (
                <SelectItem key={"empty"}>No Homerooms</SelectItem>
              ) : (
                homeRooms.map((room) => (
                  <SelectItem key={room.homeRoom}>{room.homeRoom}</SelectItem>
                ))
              )}
            </Select>
            <div className="py-3">
              Most Recent Queue
              <Divider className={"my-3"} />
              <div>
                {recentCars.map(
                  (
                    student: {
                      id: string | number;
                      spaceNumber: number | null;
                      homeRoom: string | null;
                      firstName: string;
                      lastName: string;
                    },
                    index
                  ) => (
                    <div key={index}>
                      {student.firstName +
                        " " +
                        student.lastName +
                        " - " +
                        student.homeRoom}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Page>
  );
}

function ParkingRows({ data, cols }: { cols: number; data: Space[] }) {
  const newData = [];
  for (let i = 0; i < 300; i += cols) {
    newData.push(data.slice(i, i + cols));
  }
  return newData.map((it, index) => (
    <ParkingRow key={index} data={it} cols={cols} />
  ));
}

function ParkingRow({ data, cols }: { cols: number; data: Space[] }) {
  const column =
    cols === 10
      ? "grid-cols-10"
      : cols === 15
        ? "grid-cols-15"
        : "auto-grid-auto";
  return (
    <div className={`grid ${column}`}>
      {data.map((it) => (
        <ParkingTile key={`${it.id}-${it.status}`} space={it} />
      ))}
    </div>
  );
}

function ParkingTile({ space }: { space: Space }) {
  const revalidator = useRevalidator();
  const { timestamp, status, spaceNumber } = space;
  const data = useRouteLoaderData<typeof rootLoader>("root");
  const [newStatus, setNewStatus] = useState(status);

  const fetcher = useFetcher();
  const updateToActive = (spaceNumber: number) => {
    setNewStatus(Status.ACTIVE);
    setColor(
      "bg-[#E9D500] text-[#193B4B] rounded-small flex items-center justify-center"
    );
    fetcher.submit(
      {
        space: spaceNumber
      },
      {
        method: "post",
        action: `update/${spaceNumber}`
      }
    );
  };

  const updateToEmpty = (spaceNumber: number) => {
    setNewStatus(Status.EMPTY);
    setColor("bg-[#193B4B] text-white");
    fetcher.submit(
      {
        space: spaceNumber
      },
      {
        method: "post",
        action: `empty/${spaceNumber}`
      }
    );
  };

  // 30 second timeout
  const timeoutInterval = 30000;
  const timeout = () => {
    if (timestamp) {
      return (
        newStatus === Status.ACTIVE &&
        new Date().getTime() - new Date(timestamp).getTime() >
          Math.abs(timeoutInterval)
      );
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (revalidator.state === "idle") {
      setColor(tileColor(newStatus, timeout()));
    }
  }, [revalidator.state]);

  const [color, setColor] = useState(tileColor(newStatus, timeout()));

  const commonClasses =
    "border-1 border-black flex items-center justify-center drop-shadow-sm";

  return data?.permitted ? (
    newStatus === Status.EMPTY ? (
      <div
        className={`${color} ${commonClasses}`}
        onClick={() => updateToActive(spaceNumber)}
      >
        {spaceNumber}
      </div>
    ) : (
      newStatus === Status.ACTIVE && (
        <Popover>
          <PopoverTrigger>
            <div className={`${color} ${commonClasses}`}>
              <SendFilledIcon />
              {spaceNumber}
            </div>
          </PopoverTrigger>
          <PopoverContent>
            <div className="px-1 py-2">
              <div className="text-small font-bold">
                Would you like to set this active parking spot to empty?
              </div>
              <Button
                className="max-w-xs"
                color="warning"
                onClick={() => updateToEmpty(spaceNumber)}
              >
                Mark Empty
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )
    )
  ) : (
    <div className={`${color} ${commonClasses}`}>
      {newStatus === Status.ACTIVE && <SendFilledIcon />}
      {spaceNumber}
    </div>
  );
}

function tileColor(status: Status, timeout?: boolean) {
  switch (status) {
    case "ACTIVE":
      return timeout
        ? "bg-green-200 text-black rounded-small flex items-center"
        : "bg-[#E9D500] text-[#193B4B] rounded-small flex items-center justify-center";
    case "EMPTY":
      return "bg-[#193B4B] text-white";
  }
}
