import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { workExperienceSchema, WorkExperienceValues } from "@/lib/validations";
import { EditorFormProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripHorizontal, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import {arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {CSS} from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import { generateSummary } from "@/actions/gemini";

// Import your generateSummary function
// import { generateSummary } from "@/lib/ai-service"; // Adjust path as needed

export default function WorkExperienceForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const [experienceLoading, setExperienceLoading] = useState<Record<number, boolean>>({});

  const form = useForm<WorkExperienceValues>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      workExperiences: resumeData.workExperiences || [],
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({
        ...resumeData,
        workExperiences:
          values.workExperiences?.filter((exp) => exp !== undefined) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "workExperiences",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  
  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIndex = fields.findIndex((field) => field.id === active.id);
      const newIndex = fields.findIndex((field) => field.id === over.id);
      move(oldIndex, newIndex);
      return arrayMove(fields, oldIndex, newIndex);
    }
  }

  const handleExperienceGenerateWithAI = async (index: number) => {
    setExperienceLoading((prevState) => ({ ...prevState, [index]: true }));
    
    const currentValues = form.getValues();
    const selectedExperience = currentValues.workExperiences?.[index];
    
    if (!selectedExperience || !selectedExperience.position || !selectedExperience.company) {
      toast.error(
        'Please fill in the position and company fields before generating AI description.'
      );
      setExperienceLoading((prevState) => ({ ...prevState, [index]: false }));
      return;
    }

    const jobTitle = selectedExperience.position;
    const company = selectedExperience.company;
    const existingDescription = selectedExperience.description || '';

    try {
      // Replace this with your actual generateSummary function call
      const response = await generateSummary(`
Write resume-ready bullet points for the job title "${jobTitle}" at "${company}". 
- Use strong action verbs in past tense (e.g., "Developed", "Led", "Implemented").
- Keep each point concise (1–2 lines max).
- Focus on measurable achievements and responsibilities.
- Return ONLY plain text bullet points with no code blocks, no headings, no introductions.
- Format as an unordered list using <ul><li>...</li></ul> in HTML.
- Do not include "Duties and Responsibilities" as a heading.

Existing description to incorporate if relevant: ${existingDescription}
`);

      // Update the form field with the AI-generated content
      form.setValue(`workExperiences.${index}.description`, response);
      
      // Trigger form validation and update
      await form.trigger(`workExperiences.${index}.description`);
      
      toast.success('✅ AI description generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to generate description.');
    } finally {
      setExperienceLoading((prevState) => ({ ...prevState, [index]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Work Experience</h2>
        <p className="text-muted-foreground text-sm italic">
          Add your work experiences. This information will be displayed on your
          resume.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={fields}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, index) => (
                <WorkExperienceFormItem
                  id={field.id}
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  onGenerateWithAI={handleExperienceGenerateWithAI}
                  isGenerating={experienceLoading[index] || false}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  position: "",
                  company: "",
                  description: "",
                  startDate: "",
                  endDate: "",
                })
              }
            >
              Add Work Experience
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

interface WorkExperienceFormItemProps {
  id: string;
  form: UseFormReturn<WorkExperienceValues>;
  index: number;
  remove: (index: number) => void;
  onGenerateWithAI: (index: number) => void;
  isGenerating: boolean;
}

function WorkExperienceFormItem({
  form,
  index,
  remove,
  id,
  onGenerateWithAI,
  isGenerating
}: WorkExperienceFormItemProps) {

  const {attributes, listeners, setNodeRef, transform, transition, isDragging}  = useSortable({id})

  return (
    <div className={cn("bg-background space-y-3 rounded-md border p-3", isDragging && "shadow-xl z-50 cursor-grab relative")} ref={setNodeRef}
    style={{transform: CSS.Transform.toString(transform), transition}}
    >
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Work Experience {index + 1}</span>
        <GripHorizontal className="text-muted-foreground size-5 cursor-grab focus:outline-none" 
        {...attributes}
        {...listeners}
        />
      </div>
      
      <FormField
        control={form.control}
        name={`workExperiences.${index}.position`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Position</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Position e.g. Senior Developer"
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`workExperiences.${index}.company`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Company</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Company e.g. Eunny Tech"
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name={`workExperiences.${index}.startDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="month"
                  placeholder="MM/YYYY"
                  value={field.value?.slice(0, 7) || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`workExperiences.${index}.endDate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>End Date</FormLabel> {/* Fixed: was "Start Date" */}
              <FormControl>
                <Input
                  {...field}
                  type="month"
                  placeholder="MM/YYYY"
                  value={field.value?.slice(0, 7) || ""}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <FormDescription className="italic text-xs text-end">
        Leave <span className="font-bold">end date</span> empty if this is your current position
      </FormDescription>
      
      <FormField
        control={form.control}
        name={`workExperiences.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Description e.g. For the position of a senior developer at Eunny Tech"
                autoFocus
                rows={4}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          type="button" 
          onClick={() => onGenerateWithAI(index)}
          disabled={isGenerating}
          className="flex-1"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate with AI
            </>
          )}
        </Button>
        
        <Button variant="destructive" type="button" onClick={() => remove(index)}>
          Remove
        </Button>
      </div>
    </div>
  );
}