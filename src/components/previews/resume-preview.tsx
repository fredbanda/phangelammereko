import { BorderStyles } from "@/app/(main)/editor/BorderStyleButton";
import useDimensions from "@/hooks/useDimensions";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validations";
import { formatDate } from "@/utils/date-format";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ResumePreviewProps {
  resumeData: ResumeValues;
  className?: string;
}

export default function ResumePreview({
  resumeData,
  className,
}: ResumePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(containerRef);

  return (
    <div
      className={cn(
        "aspect-[210/297] h-fit w-full bg-white text-black",
        className,
      )}
      ref={containerRef}
    >
      <div
        className={cn("space-y-6 p-6", !width && "invisible")}
        style={{
          zoom: width ? width / 794 : 1, // prevent NaN
        }}
      >
        <PersonalInfoHeader resumeData={resumeData} />
        <SummarySection resumeData={resumeData} />
        <WorkExperienceSection resumeData={resumeData} />
        <EducationSection resumeData={resumeData} />
        <SkillsSection resumeData={resumeData} />
        <CertificationsSection resumeData={resumeData} />
        <AwardsSection resumeData={resumeData} />
        <ProjectsPublicationSection resumeData={resumeData} />
      </div>
    </div>
  );
}

interface ResumeSectionProps {
  resumeData: ResumeValues;
}

function PersonalInfoHeader({ resumeData }: ResumeSectionProps) {
  const {
    photo,
    firstName,
    lastName,
    jobTitle,
    email,
    phone,
    address,
    location,
    city,
    country,
    linkedin,
    github,
    twitter,
    portfolioUrl,
    colorHex,
    borderStyle,
  } = resumeData;
  const [photoSrc, setPhotoSrc] = useState(photo instanceof File ? "" : photo);

  useEffect(() => {
    const objectUrl =
      photo instanceof File ? URL.createObjectURL(photo) : photo;
    if (objectUrl) setPhotoSrc(objectUrl);
    if (photo === null) setPhotoSrc("");
    return () => {
      if (photo instanceof File && typeof objectUrl === "string") {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [photo]);

  return (
    <div className="flex items-center gap-6">
      {photoSrc && (
        <Image
          src={photoSrc}
          width={100}
          height={100}
          alt="Photo"
          className="aspect-square object-cover"
          style={{
            borderRadius:
              borderStyle === BorderStyles.SQUARE
                ? "0px"
                : borderStyle === BorderStyles.CIRCLE
                  ? "9999px"
                  : "10%",
          }}
        />
      )}

      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-3xl font-bold" style={{ color: colorHex }}>
            {firstName} {lastName}
          </p>
          <p className="font-medium" style={{ color: colorHex }}>
            {jobTitle}
          </p>
        </div>
        <p className="text-xs text-gray-500">
          {address}
          {address && location && city && country ? ", " : ""}
          {location}
          {location && city && country ? ", " : ""}
          {city}
          {city && country ? ", " : ""}
          {country}
        </p>
        <p className="flex justify-between text-xs text-gray-500">
          <span>{email}</span>
          <span>{phone}</span>
        </p>

        <p className="text-xs text-gray-500">
          {[linkedin, github, twitter, portfolioUrl]
            .filter(Boolean)
            .join(" | ")}
        </p>
      </div>
    </div>
  );
}

function SummarySection({ resumeData }: ResumeSectionProps) {
  const { summary, colorHex, borderStyle } = resumeData;

  if (!summary) return null;

  return (
    <>
      <hr className="border-1 dark:border-gray-600" style={{ color: borderStyle }} />

      <div className="break-inside-avoid space-y-3">
        <p
          className="mt-[-14px] text-lg font-semibold"
          style={{ color: colorHex }}
        >
          Professional Summary
        </p>
        <div className="text-sm whitespace-pre-line">{summary}</div>
      </div>
    </>
  );
}

function WorkExperienceSection({ resumeData }: ResumeSectionProps) {
  const { workExperiences, colorHex, borderStyle } = resumeData;

  const workExperiencesNotEmpty = workExperiences?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!workExperiencesNotEmpty) return null;

  return (
    <>
      <hr className="border-1 dark:border-gray-600" style={{ color: borderStyle }} />

      <div className="space-y-3">
        <p
          className="mt-[-14px] text-lg font-semibold"
          style={{ color: colorHex }}
        >
          Work Experience
        </p>
        {workExperiencesNotEmpty.map((exp, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{exp.position}</span>
              {exp.startDate && (
                <span>
                  {formatDate(exp.startDate)}
                  {" — "}
                  {exp.endDate ? formatDate(exp.endDate) : "Present"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{exp.company}</p>
            <div className="text-xs whitespace-pre-line">{exp.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function EducationSection({ resumeData }: ResumeSectionProps) {
  const { educations, colorHex } = resumeData;

  const educationsNotEmpty = educations?.filter(
    (exp) => Object.values(exp).filter(Boolean).length > 0,
  );

  if (!educationsNotEmpty) return null;

  return (
    <>
      <hr className="border-1 dark:border-gray-600" />

      <div className="space-y-3">
        <p
          className="mt-[-14px] text-lg font-semibold"
          style={{ color: colorHex }}
        >
          Education
        </p>
        {educationsNotEmpty.map((edu, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{edu.institution}</span>
              {edu.startDate && (
                <span>
                  {formatDate(edu.startDate)}
                  {" — "}
                  {edu.endDate ? formatDate(edu.endDate) : "Present"}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold">{edu.qualification}</p>
            <div className="text-xs whitespace-pre-line">
              {[edu.city, edu.country].filter(Boolean).join(", ")}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function SkillsSection({ resumeData }: ResumeSectionProps) {
  const { skills, colorHex } = resumeData;

  const skillsNotEmpty = skills?.filter(
    (skill) => Object.values(skill).filter(Boolean).length > 0,
  );
  if (!skillsNotEmpty) return null;

  return (
    <>
      <hr className="border-1 dark:border-gray-600" />

      <div className="space-y-3">
        <p
          className="mt-[-14px] text-lg font-semibold"
          style={{ color: colorHex }}
        >
          Skills
        </p>
        {skillsNotEmpty.map((skill, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <p className="text-xs font-semibold">{skill.title}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function CertificationsSection({ resumeData }: ResumeSectionProps) {
  const { certifications, colorHex } = resumeData;

  const certificationsNotEmpty = certifications?.filter(
    (cert) => Object.values(cert).filter(Boolean).length > 0,
  );

  if (!certificationsNotEmpty) return null;

  return (
    <>
      <hr className="border-1 dark:border-gray-600" />

      <div className="space-y-3">
        <p
          className="mt-[-14px] text-lg font-semibold"
          style={{ color: colorHex }}
        >
          Certifications
        </p>
        {certificationsNotEmpty.map((cert, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{cert.certification}</span>
              {cert.year && <span>{formatDate(cert.year)}</span>}
            </div>
            <p className="text-xs font-semibold">{cert.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function AwardsSection({ resumeData }: ResumeSectionProps) {
  const { awards, colorHex } = resumeData;

  const awardsNotEmpty = awards?.filter(
    (award) => Object.values(award).filter(Boolean).length > 0,
  );

  if (!awardsNotEmpty) return null;

  return (
    <>
      <hr className="border-1 dark:border-gray-600" />

      <div className="space-y-3">
        <p
          className="mt-[-14px] text-lg font-semibold"
          style={{ color: colorHex }}
        >
          Awards
        </p>
        {awardsNotEmpty.map((award, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{award.title}</span>
              {award.date && <span>{formatDate(award.date)}</span>}
            </div>
            <p className="text-xs font-semibold">{award.description}</p>
            <div className="text-xs whitespace-pre-line">{award.issuer}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProjectsPublicationSection({ resumeData }: ResumeSectionProps) {
  const { projectsPublications, colorHex } = resumeData;

  const publicationsNotEmpty = projectsPublications?.filter(
    (pub) => Object.values(pub).filter(Boolean).length > 0,
  );

  if (!publicationsNotEmpty) return null;

  return (
    <>
      <hr className="border-1 dark:border-gray-600" />

      <div className="space-y-3">
        <p
          className="mt-[-14px] text-lg font-semibold"
          style={{ color: colorHex }}
        >
          Projects & Publications
        </p>
        {publicationsNotEmpty.map((pub, index) => (
          <div key={index} className="break-inside-avoid space-y-1">
            <div
              className="flex items-center justify-between text-sm font-semibold"
              style={{ color: colorHex }}
            >
              <span>{pub.title}</span>
              {pub.publicationDate && (
                <span>{formatDate(pub.publicationDate)}</span>
              )}
            </div>

            <div className="text-xs whitespace-pre-line">
              <p className="text-xs">
                {pub.link && <a href={pub.link}>{pub.link}</a>}
              </p>
              <p className="text-xs">{pub.type && <span>{pub.type}</span>}</p>
              <p className="text-xs">
                {pub.publisher && <span>{pub.publisher}</span>}
              </p>
              <p className="text-xs font-normal">{pub.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
