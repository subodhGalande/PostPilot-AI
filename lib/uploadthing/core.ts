import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { requireAuthJose } from "@/lib/auth/auth";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "2MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      const authUser = await requireAuthJose();
      if (!authUser?.id) throw new UploadThingError("Unauthorized");
      return { userId: authUser.id };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Avatar upload complete:", file.ufsUrl);
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
