import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  projectsPublicationSchema,
  ProjectsPublicationValues,
} from "@/lib/validations";
import { EditorFormProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripHorizontal, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Assuming you're using sonner for toasts
import { generateSummary } from "@/actions/gemini";

// Import your generateSummary function
// import { generateSummary } from "@/lib/ai-service"; // Adjust path as needed

export default function ProjectsPublicationForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const [projectLoading, setProjectLoading] = useState<Record<number, boolean>>({});

  const form = useForm<ProjectsPublicationValues>({
    resolver: zodResolver(projectsPublicationSchema),
    defaultValues: {
      projectsPublications: resumeData.projectsPublications || [],
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({
        ...resumeData,
        projectsPublications:
          values.projectsPublications?.filter((pub) => pub !== undefined) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "projectsPublications",
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

  const handleProjectGenerateWithAI = async (index: number) => {
    setProjectLoading((prevState) => ({ ...prevState, [index]: true }));
    
    const currentValues = form.getValues();
    const selectedProject = currentValues.projectsPublications?.[index];
    
    if (!selectedProject || !selectedProject.title?.trim()) {
      toast.error(
        'Please fill in the title field before generating AI description.'
      );
      setProjectLoading((prevState) => ({ ...prevState, [index]: false }));
      return;
    }

    const title = selectedProject.title;
    const publisher = selectedProject.publisher || '';
    const type = selectedProject.type || '';
    const existingDescription = selectedProject.description || '';

    try {
      const response = await generateSummary(`
Write a professional resume-ready description for the following project/publication/award:

Title: "${title}"
Publisher/Issuer: "${publisher}"
Type: "${type}"

Requirements:
- Write 2-4 sentences maximum
- Focus on the significance and impact
- Use professional, resume-appropriate language
- Highlight key achievements or contributions
- If it's an award, mention what it recognizes
- If it's a project, mention technologies/skills used
- If it's a publication, mention the scope/audience
- Return ONLY the description text, no formatting

Existing description to incorporate if relevant: ${existingDescription}

Professional description:
`);

      // Update the form field with the AI-generated content
      form.setValue(`projectsPublications.${index}.description`, response.trim());
      
      // Trigger form validation and update
      await form.trigger(`projectsPublications.${index}.description`);
      
      toast.success('✅ AI description generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to generate description.');
    } finally {
      setProjectLoading((prevState) => ({ ...prevState, [index]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Projects & Publications</h2>
        <p className="text-muted-foreground text-sm italic">
          Please add any of your projects & publications accumulated over the
          years please leave blank if none.
        </p>
      </div>
      <Form {...form}>
        <div className="space-y-3">
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
                <ProjectsPublicationFormItem
                  id={field.id}
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  onGenerateWithAI={handleProjectGenerateWithAI}
                  isGenerating={projectLoading[index] || false}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex justify-center">
            <Button
              type="button"
              onClick={() =>
                append({
                  title: "",
                  description: "",
                  link: "",
                  type: "",
                  publisher: "",
                  publicationDate: "",
                })
              }
            >
              Add Portfolio or Publication
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

interface ProjectsPublicationFormItemProps {
  id: string;
  form: UseFormReturn<ProjectsPublicationValues>;
  index: number;
  remove: (index: number) => void;
  onGenerateWithAI: (index: number) => void;
  isGenerating: boolean;
}

function ProjectsPublicationFormItem({
  form,
  index,
  remove,
  id,
  onGenerateWithAI,
  isGenerating
}: ProjectsPublicationFormItemProps) {

  const {attributes, listeners, setNodeRef, transform, transition, isDragging}  = useSortable({id})

  return (
    <div className={cn("bg-background space-y-3 rounded-md border p-3", isDragging && "shadow-xl z-50 cursor-grab relative")} ref={setNodeRef}
    style={{transform: CSS.Transform.toString(transform), transition}}
    >
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Project/Publication {index + 1}</span>
        <GripHorizontal className="text-muted-foreground size-5 cursor-grab focus:outline-none"
        {...attributes}
        {...listeners}
         />
      </div>
      
      <FormField
        control={form.control}
        name={`projectsPublications.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title of Portfolio or Publication</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. Best Developer Award" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`projectsPublications.${index}.link`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Link</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Link to your portfolio or publication"
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`projectsPublications.${index}.type`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Type of Publication or Portfolio</FormLabel>
            <FormControl>
              <Input {...field} placeholder="like Photography" autoFocus />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`projectsPublications.${index}.publicationDate`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Publication Date / blank for portfolio</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="month"
                placeholder="e.g. 2022-01"
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
        name={`projectsPublications.${index}.publisher`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Publisher/Issuer (leave empty if this is your portfolio)
            </FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. IEEE, GitHub, Company Name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`projectsPublications.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="Describe your publication or portfolio"
                autoFocus
                rows={3}
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
              Generate Description
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