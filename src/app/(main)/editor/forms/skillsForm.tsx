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
import { skillSchema, SkillValues } from "@/lib/validations";
import { EditorFormProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripHorizontal, Sparkles, Brain } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner"; // Assuming you're using sonner for toasts

export default function SkillsForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);
  const [skillLoading, setSkillLoading] = useState<Record<number, boolean>>({});

  const form = useForm<SkillValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skills: resumeData.skills || [],
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({
        ...resumeData,
        skills:
          values.skills?.filter((ski) => ski !== undefined) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const generateSkillsFromWorkExperience = async () => {
    setIsGeneratingSkills(true);

    // Check if there are work experiences to analyze
    if (!resumeData.workExperiences || resumeData.workExperiences.length === 0) {
      toast.error(
        'Please add some work experiences first before generating skills.'
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
Analyze the following work experiences and generate a comprehensive list of relevant skills that would be valuable for this professional's resume.

${personalContext}

Work Experiences:
${workExperienceSummary}

Please generate skills in the following categories:
1. Technical Skills (programming languages, software, tools, technologies)
2. Soft Skills (communication, leadership, problem-solving, etc.)
3. Industry-Specific Skills (domain knowledge, certifications, methodologies)

Requirements:
- Return ONLY the skills as plain text
- Each skill should be on a separate line
- Focus on skills that are clearly demonstrated or implied by the work experiences
- Include both hard and soft skills
- Prioritize skills that are most relevant to the positions held
- Limit to 15-20 most important skills
- No bullet points, no numbering, no categories - just skill names
- Examples: "JavaScript", "Team Leadership", "Agile Methodology", "Customer Service"
- If possible include a short description of each skill about 3 to 5 words please 
- Format as bulleted list with no headings or subheadings please use a big dot (•) for each point.

Generate skills based on the work experiences provided above.
`);

      // Parse the response and create skill entries
      const skillsList = response
        .split('\n')
        .map(skill => skill.trim())
        .filter(skill => skill.length > 0)
        .slice(0, 20); // Limit to 20 skills

      // Add new AI-generated skills to existing ones
      skillsList.forEach(skill => {
        append({ title: skill });
      });

      toast.success(`✅ Generated ${skillsList.length} skills based on your work experience!`);
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to generate skills from work experience.');
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  const generateSingleSkillWithAI = async (index: number) => {
    setSkillLoading((prevState) => ({ ...prevState, [index]: true }));
    
    const currentValues = form.getValues();
    
    // Add null check for skills array
    if (!currentValues.skills || currentValues.skills.length <= index) {
      toast.error('Invalid skill entry.');
      setSkillLoading((prevState) => ({ ...prevState, [index]: false }));
      return;
    }
    
    const currentSkill = currentValues.skills[index];
    
    if (!currentSkill || !currentSkill.title?.trim()) {
      toast.error('Please enter a skill keyword to enhance with AI.');
      setSkillLoading((prevState) => ({ ...prevState, [index]: false }));
      return;
    }

    try {
      // Get context from work experiences
      const workContext = resumeData.workExperiences?.map(exp => 
        `${exp.position} at ${exp.company}`
      ).join(', ') || 'No work experience provided';

      const response = await generateSummary(`
Enhance the following skill entry for a professional resume. The person has worked as: ${workContext}

Current skill: "${currentSkill.title}"

Please provide an enhanced, professional version of this skill that:
- Is concise and resume-appropriate
- Uses industry-standard terminology
- Is specific and measurable where possible
- Fits the professional context
- Returns ONLY the enhanced skill name, no explanations

Example: If input is "coding" and person worked as "Software Developer", output might be "Full-Stack Development" or "Software Development"

Enhanced skill:
`);

      // Update the form field with the enhanced skill
      form.setValue(`skills.${index}.title`, response.trim());
      await form.trigger(`skills.${index}.title`);
      
      toast.success('✅ Skill enhanced with AI!');
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to enhance skill.');
    } finally {
      setSkillLoading((prevState) => ({ ...prevState, [index]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Skills</h2>
        <p className="text-muted-foreground text-sm italic">
          Add your technical/hard and soft skills for your CV/resume.
        </p>
      </div>
      
      {/* AI Skills Generation Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-800">AI Skills Generator</h3>
        </div>
        <p className="text-sm text-blue-700">
          Let AI analyze your work experiences and generate relevant skills for your resume.
        </p>
        <Button
          type="button"
          onClick={generateSkillsFromWorkExperience}
          disabled={isGeneratingSkills}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGeneratingSkills ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Analyzing Work Experience...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Skills from Work Experience
            </>
          )}
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-3">
          {fields.map((field, index) => (
            <SkillsFormItem
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
              Add Your Skills
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

interface SkillsFormItemProps {
  form: UseFormReturn<SkillValues>;
  index: number;
  remove: (index: number) => void;
  onEnhanceWithAI: (index: number) => void;
  isEnhancing: boolean;
}

function SkillsFormItem({
  form,
  index,
  remove,
  onEnhanceWithAI,
  isEnhancing
}: SkillsFormItemProps) {
  return (
    <div className="bg-background space-y-3 rounded-md border p-3">
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Skills {index + 1}</span>
        <GripHorizontal className="text-muted-foreground size-5 cursor-grab" />
      </div>
      
      <FormField
        control={form.control}
        name={`skills.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea
                {...field}
                placeholder="e.g. JavaScript, Team Leadership, Project Management"
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
          variant="destructive"
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