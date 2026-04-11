-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "status" "AccountStatus" NOT NULL DEFAULT 'PENDING';
