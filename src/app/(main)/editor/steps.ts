import { EditorFormProps } from "@/utils/types";
import GeneralInfoForm from "./forms/general-info-form";
import PersonalInfoForm from "./forms/personal-info-form";
import WorkExperienceForm from "./forms/work-experience-form";
import EducationForm from "./forms/education-form";
import SkillsForm from "./forms/skillsForm";
import CertificationsForm from "./forms/certifications-form";
import AwardForm from "./forms/awards-form";
import SummaryForm from "./forms/summary-form";
import ProjectsPublicationForm from "./forms/project-publication-form";
import SoftSkillsForm from "./forms/SoftSkills";

export const steps: {
    title: string;
    component: React.ComponentType<EditorFormProps>;
    key: string;

}[] = [
    {
        title: "General Info",
        component: GeneralInfoForm,
        key: "general-info",
    },
    {
        title: "Personal Details",
        component: PersonalInfoForm,
        key: "personal-info",
    },
    {
        title: "Experience",
        component: WorkExperienceForm,
        key: "work-experience",
    },
    {
        title: "Education",
        component: EducationForm,
        key: "education",
    },
    {
        title: "Hard Skills",
        component: SkillsForm,
        key: "skills",
    },
    {
        title: "Soft Skills",
        component: SoftSkillsForm,
        key: "soft-skills",
    },
    {
        title: "Certifications",
        component: CertificationsForm,
        key: "certifications",
    },
    {
        title: "Awards",
        component: AwardForm,
        key: "awards"
    },
    {
        title: "Projects",
        component: ProjectsPublicationForm,
        key: "projects"
    },
    {
        title: "Summary",
        component: SummaryForm,
        key: "summary"
    }

];