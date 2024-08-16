-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'TIMEOUT', 'EMPTY');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "kindeId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "homeRoom" TEXT NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "spaceNumber" INTEGER,
    "homeRoom" TEXT,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" SERIAL NOT NULL,
    "spaceNumber" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'EMPTY',
    "timestamp" TEXT,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_kindeId_key" ON "User"("kindeId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_homeRoom_key" ON "Teacher"("homeRoom");

-- CreateIndex
CREATE UNIQUE INDEX "Space_spaceNumber_key" ON "Space"("spaceNumber");

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_spaceNumber_fkey" FOREIGN KEY ("spaceNumber") REFERENCES "Space"("spaceNumber") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_homeRoom_fkey" FOREIGN KEY ("homeRoom") REFERENCES "Teacher"("homeRoom") ON DELETE SET NULL ON UPDATE CASCADE;
