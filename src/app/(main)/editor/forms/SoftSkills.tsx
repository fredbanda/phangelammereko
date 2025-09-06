import { generateSummary } from "@/actions/gemini";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { softSkillSchema, SoftSkillValues } from "@/lib/validations";
import { EditorFormProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripHorizontal, Sparkles, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

export default function SoftSkillsForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [skillLoading, setSkillLoading] = useState<Record<number, boolean>>({});

  const form = useForm<SoftSkillValues>({
    resolver: zodResolver(softSkillSchema),
    defaultValues: {
      softSkills: resumeData.softSkills || [], // Fixed: Now using softSkills
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({
        ...resumeData,
        softSkills: // Fixed: Now updating softSkills instead of skills
          values.softSkills?.filter((softSkill) => softSkill !== undefined) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "softSkills",
  });

  const generateSkillsFromWorkExperience = async () => {
    setIsGeneratingSkills(true);

    // Check if there are work experiences to analyze
    if (!resumeData.workExperiences || resumeData.workExperiences.length === 0) {
      toast.error(
        'Please add some work experiences first before generating soft skills.'
      );
      setIsGeneratingSkills(false);
      return;
    }

    try {
      // Create a comprehensive summary of all work experiences
      const workExperienceSummary = resumeData.workExperiences
        .map((exp, index) => {
          return `Job ${index + 1}:
Position: ${exp.position || 'Not specified'}
Company: ${exp.company || 'Not specified'}
Duration: ${exp.startDate || 'Not specified'} to ${exp.endDate || 'Present'}
Description: ${exp.description || 'No description provided'}`;
        })
        .join('\n\n');

      // Also include personal info for context if available
      const personalContext = resumeData.educations ? `
Professional: ${resumeData.firstName} ${resumeData.lastName}
Current Role/Title: ${resumeData.jobTitle || 'Not specified'}` : '';

      const response = await generateSummary(`
Analyze the following work experiences and generate a comprehensive list of relevant SOFT SKILLS that would be valuable for this professional's resume.

${personalContext}

Work Experiences:
${workExperienceSummary}

Please generate SOFT SKILLS in the following categories:
1. Communication Skills (verbal communication, written communication, presentation skills, active listening)
2. Leadership Skills (team leadership, mentoring, delegation, decision-making, conflict resolution)
3. Problem-Solving Skills (critical thinking, analytical thinking, creativity, innovation, adaptability)
4. Interpersonal Skills (teamwork, collaboration, emotional intelligence, networking, customer service)
5. Personal Skills (time management, organization, attention to detail, work ethic, flexibility)

Requirements:
- Return ONLY soft skills (people skills, personality traits, work habits) - NO technical skills
- Each skill should be on a separate line
- Focus on soft skills that are clearly demonstrated or implied by the work experiences
- Prioritize skills that are most relevant to the positions held
- Please Limit to 3-5 most important soft skills
- If possible include a short description of each skill about 3 to 5 words please like Leadership: guides, mentors, and inspires
- Format as bulleted list with no headings or subheadings please use a big dot (•) for each point
- Examples: "Team Leadership", "Problem Solving", "Communication", "Time Management", "Adaptability"

Generate SOFT SKILLS based on the work experiences provided above.
`);

      // Parse the response and create skill entries
      const softSkillsList = response
        .split('\n')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .slice(0, 15); // Limit to 15 skills

      // Add new AI-generated soft skills to existing ones
      softSkillsList.forEach(skill => {
        append({ title: skill });
      });

      toast.success(`✅ Generated ${softSkillsList.length} soft skills based on your work experience!`);
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to generate soft skills from work experience.');
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  const generateSingleSkillWithAI = async (index: number) => {
    setSkillLoading((prevState) => ({ ...prevState, [index]: true }));
    
    const currentValues = form.getValues();
    
    // Add null check for softSkills array
    if (!currentValues.softSkills || currentValues.softSkills.length <= index) {
      toast.error('Invalid soft skill entry.');
      setSkillLoading((prevState) => ({ ...prevState, [index]: false }));
      return;
    }
    
    const currentSoftSkill = currentValues.softSkills[index];
    
    if (!currentSoftSkill || !currentSoftSkill.title?.trim()) {
      toast.error('Please enter a soft skill keyword to enhance with AI.');
      setSkillLoading((prevState) => ({ ...prevState, [index]: false }));
      return;
    }

    try {
      // Get context from work experiences
      const workContext = resumeData.workExperiences?.map(exp => 
        `${exp.position} at ${exp.company}`
      ).join(', ') || 'No work experience provided';

      const response = await generateSummary(`
Enhance the following SOFT SKILL entry for a professional resume. The person has worked as: ${workContext}

Current soft skill: "${currentSoftSkill.title}"

Please provide an enhanced, professional version of this SOFT SKILL that:
- Is a people skill, personality trait, or work habit (NOT a technical skill)
- Is concise and resume-appropriate
- Uses industry-standard terminology for soft skills
- Is specific and professional
- Fits the professional context
- Returns ONLY the enhanced soft skill name, no explanations

Examples: 
- Input: "talking" → Output: "Verbal Communication"
- Input: "leading" → Output: "Team Leadership" 
- Input: "organizing" → Output: "Project Organization"

Enhanced soft skill:
`);

      // Update the form field with the enhanced soft skill
      form.setValue(`softSkills.${index}.title`, response.trim());
      await form.trigger(`softSkills.${index}.title`);
      
      toast.success('✅ Soft skill enhanced with AI!');
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to enhance soft skill.');
    } finally {
      setSkillLoading((prevState) => ({ ...prevState, [index]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Soft Skills</h2>
        <p className="text-muted-foreground text-sm italic">
          Add your interpersonal skills, leadership abilities, and personal qualities for your CV/resume.
        </p>
      </div>
      
      {/* AI Skills Generation Section */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-green-800">AI Soft Skills Generator</h3>
        </div>
        <p className="text-sm text-green-700">
          Let AI analyze your work experiences and generate relevant soft skills for your resume.
        </p>
        <Button
          type="button"
          onClick={generateSkillsFromWorkExperience}
          disabled={isGeneratingSkills}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isGeneratingSkills ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing Work Experience...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Soft Skills from Work Experience
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-3">
          {fields.map((field, index) => (
            <SoftSkillsFormItem
              key={field.id}
              index={index}
              form={form}
              remove={remove}
              onEnhanceWithAI={generateSingleSkillWithAI}
              isEnhancing={skillLoading[index] || false}
            />
          ))}
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  title: "",
                })
              }
            >
              Add Soft Skill
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

interface SoftSkillsFormItemProps {
  form: UseFormReturn<SoftSkillValues>;
  index: number;
  remove: (index: number) => void;
  onEnhanceWithAI: (index: number) => void;
  isEnhancing: boolean;
}

function SoftSkillsFormItem({
  form,
  index,
  remove,
  onEnhanceWithAI,
  isEnhancing
}: SoftSkillsFormItemProps) {
  return (
    <div className="bg-background space-y-3 rounded-md border p-3">
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Soft Skill {index + 1}</span>
        <GripHorizontal className="text-muted-foreground size-5 cursor-grab" />
      </div>
      
      <FormField
        control={form.control}
        name={`softSkills.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                {...field}
                placeholder="e.g. Team Leadership, Problem Solving, Communication, Time Management"
                autoFocus
                rows={2}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex gap-2">
        <Button 
          variant="secondary"
          type="button" 
          onClick={() => onEnhanceWithAI(index)}
          disabled={isEnhancing}
          size="sm"
          className="flex-1"
        >
          {isEnhancing ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-3 w-3" />
              Enhance with AI
            </>
          )}
        </Button>
        
        <Button variant="destructive" type="button" onClick={() => remove(index)} size="sm">
          Remove
        </Button>
      </div>
    </div>
  );
}