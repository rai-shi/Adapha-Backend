-- CreateTable
CREATE TABLE "IntroductionVideo" (
    "id" SERIAL NOT NULL,
    "image" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntroductionVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntroductionVideoTranslation" (
    "id" SERIAL NOT NULL,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoId" INTEGER NOT NULL,

    CONSTRAINT "IntroductionVideoTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IntroductionVideoTranslation_videoId_language_key" ON "IntroductionVideoTranslation"("videoId", "language");

-- AddForeignKey
ALTER TABLE "IntroductionVideoTranslation" ADD CONSTRAINT "IntroductionVideoTranslation_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "IntroductionVideo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
