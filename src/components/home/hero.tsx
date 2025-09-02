import Image from "next/image";

export default function HeroSection() {
  return (
    <div className="relative mx-auto flex max-w-screen-xl flex-col items-center p-8 px-4 sm:px-6 md:flex-row">
      <div className="flex items-center py-5 md:w-1/2 md:pt-10 md:pr-10 md:pb-20">
        <div className="text-left">
          <h2 className="text-4xl leading-10 font-extrabold tracking-tight text-gray-800 sm:text-5xl sm:leading-none md:text-6xl">
            You are <span className="font-bold text-blue-500">Not Alone</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            With applicant tracking systems (ATS) and artificial intelligence
            reshaping hiring, landing a job can feel overwhelming. That&apos;s
            where this application comes in — your personal guide to building a
            resume that gets noticed and helps you stand out with confidence.
          </p>
          <div className="mt-5 sm:flex md:mt-8">
            <div className="rounded-md shadow">
              <a
                href="/resumes"
                className="focus:shadow-outline-blue flex w-full items-center justify-center rounded-md border border-transparent bg-blue-500 px-8 py-3 text-base leading-6 font-medium text-white transition duration-150 ease-in-out hover:bg-blue-600 focus:outline-none md:px-10 md:py-4 md:text-lg"
              >
                Getting started
              </a>
            </div>
            <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
              <a
                href=""
                className="focus:shadow-outline-blue flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base leading-6 font-medium text-blue-500 transition duration-150 ease-in-out hover:text-blue-600 focus:outline-none md:px-10 md:py-4 md:text-lg"
              >
                Support Us
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center py-5 md:w-1/2 md:pt-10 md:pb-20 md:pl-10">
        <div className="relative w-full rounded p-3 md:p-8">
          <div className="w-full rounded-lg bg-white text-black">
            <Image src="/alone.jpg" alt="hero" width={600} height={400} className="rounded-lg object-fit" />
          </div>
        </div>
      </div>
    </div>
  );
}
