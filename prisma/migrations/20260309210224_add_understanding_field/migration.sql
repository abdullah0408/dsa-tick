-- CreateEnum
CREATE TYPE "Understanding" AS ENUM ('None', 'Weak', 'Fair', 'Good', 'Strong');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "understanding" "Understanding";
