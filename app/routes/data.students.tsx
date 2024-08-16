import {
  ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData
} from "@remix-run/node";
import { zcsv } from "zod-csv";
import { z } from "zod";
import invariant from "tiny-invariant";
import { convertToDataType, headerBody } from "~/csvParser/utils";
import { prisma } from "~/db.server";
import { jsonWithSuccess } from "remix-toast";

const schema = z.object({
  "Last Name": zcsv.string(z.string().min(1)),
  First: zcsv.string(z.string().min(1)),
  "Carline Number": zcsv.number(),
  Homeroom: zcsv.string(z.string().min(1))
});

const formSchema = z.object({ file: z.instanceof(File) });

export const allowedMimeTypes = {
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv"
};

type UploadedFile = {
  filepath: string;
  type: string;
};

export function isUploadedFile(file: unknown): file is UploadedFile {
  return (file as UploadedFile) != null;
}

// export const uploadHandler = unstable_composeUploadHandlers(
//   unstable_createFileUploadHandler({
//     maxPartSize: 5_000_000,
//     file: ({ filename }) => `contact-uploads/${filename}`,
//     filter: ({ contentType }) =>
//       Object.values(allowedMimeTypes).includes(contentType)
//   })
// );

export async function action({ request }: ActionFunctionArgs) {
  const uploadHandler = unstable_createMemoryUploadHandler({
    maxPartSize: 500_000
  });

  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );
  const file = formData.get("file");
  invariant(file, "Must include file");
  const h = headerBody(await file.text());
  const allCsvData = convertToDataType<typeof schema>(h.header, h.body);

  const homeRooms = new Set(h.body.map((it) => it[3]));
  for (const room of homeRooms) {
    const exists = await prisma.teacher.findFirst({
      where: { homeRoom: room }
    });
    const created =
      exists ?? (await prisma.teacher.create({ data: { homeRoom: room } }));
  }

  // @ts-ignore
  await prisma.student.createMany({ data: allCsvData });
  return jsonWithSuccess(
    { result: "Created student records from csv" },
    { message: "Created student records from csv" }
  );
}
