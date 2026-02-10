"use server";

import { generateSummary } from "@/actions/gemini";
import { GenerateSummaryInput, generateSummarySchema } from "@/lib/validations";

export async function generateSummaryGemini(input: GenerateSummaryInput) {

    const {jobTitle, workExperiences, hardSkills, summary, awards, projectsPublications} = generateSummarySchema.parse(input);

    const systemMessage = `You are a generating a resume summary to keep professional short and powerful. A professional summary should be concise, clear, and to the point. It should highlight your skills, achievements, and experiences, and provide a summary of your career trajectory. Avoid using jargon or technical terms that may not be familiar to the reader. Keep the summary between 100-150 words. just one summary please.`

    const userMessage = `
    Pleae provide a summary for the following information:
    - Job title: ${jobTitle}
    Work experience: 
    ${workExperiences?.map((exp) => `Position: ${exp.position}, company: ${exp.company}, description: ${exp.description}, startDate: ${exp.startDate}, endDate: ${exp.endDate}`).join("\n")}

    Skills:
    ${hardSkills?.map((hardSkill) => `Skill: ${hardSkill.title}`).join("\n")}

    Awards:
    ${awards?.map((award) => `Award: ${award.title}, description: ${award.description}, issuer: ${award.issuer}, date: ${award.date}`).join("\n")}

    Projects & Publications:
    ${projectsPublications?.map((pub) => `Title: ${pub.title}, description: ${pub.description}, link: ${pub.link}, type: ${pub.type}, publisher: ${pub.publisher}, publicationDate: ${pub.publicationDate}`).join("\n")}



 
    `;

    console.log("System Message", systemMessage);
    console.log("User Message", userMessage);
    

const completion = await generateSummary(systemMessage + userMessage);

console.log("Completion", completion);

const summaryGen = completion.split("\n").map((line) => line.trim()).join(" ");

console.log("Summary", summaryGen);

    return summary;
    
}