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
import { AwardValues, awardSchema } from "@/lib/validations";
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

export default function AwardForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const [awardLoading, setAwardLoading] = useState<Record<number, boolean>>({});

  const form = useForm<AwardValues>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      awards: resumeData.awards || [],
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({
        ...resumeData,
        awards: values.awards?.filter((awd) => awd !== undefined) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "awards",
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

  const handleAwardGenerateWithAI = async (index: number) => {
    setAwardLoading((prevState) => ({ ...prevState, [index]: true }));
    
    const currentValues = form.getValues();
    const selectedAward = currentValues.awards?.[index];
    
    if (!selectedAward || !selectedAward.title?.trim()) {
      toast.error(
        'Please fill in the award title before generating AI description.'
      );
      setAwardLoading((prevState) => ({ ...prevState, [index]: false }));
      return;
    }

    const awardTitle = selectedAward.title;
    const issuer = selectedAward.issuer || '';
    const existingDescription = selectedAward.description || '';

    try {
      const response = await generateSummary(`
Write a professional resume-ready description for the following award:

Award Title: "${awardTitle}"
Issuer/Organization: "${issuer}"

Requirements:
- Write 1-3 sentences maximum
- Focus on what the award recognizes and its significance
- Use professional, resume-appropriate language
- Highlight the achievement and competencies it represents
- Mention any competitive aspects if applicable
- Be specific about what skills or qualities led to this recognition
- Return ONLY the description text, no additional formatting

Existing description to incorporate if relevant: ${existingDescription}

Professional award description:
`);

      // Update the form field with the AI-generated content
      form.setValue(`awards.${index}.description`, response.trim());
      
      // Trigger form validation and update
      await form.trigger(`awards.${index}.description`);
      
      toast.success('✅ AI award description generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('❌ Failed to generate award description.');
    } finally {
      setAwardLoading((prevState) => ({ ...prevState, [index]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Awards</h2>
        <p className="text-muted-foreground text-sm italic">
          Please add any of your awards accumulated over the years
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
                <AwardFormItem
                  id={field.id}
                  key={field.id}
                  index={index}
                  form={form}
                  remove={remove}
                  onGenerateWithAI={handleAwardGenerateWithAI}
                  isGenerating={awardLoading[index] || false}
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
                  issuer: "",
                  date: "",
                })
              }
            >
              Add Awards
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

interface AwardFormItemProps {
  id: string;
  form: UseFormReturn<AwardValues>;
  index: number;
  remove: (index: number) => void;
  onGenerateWithAI: (index: number) => void;
  isGenerating: boolean;
}

function AwardFormItem({ 
  form, 
  index, 
  remove, 
  id,
  onGenerateWithAI,
  isGenerating 
}: AwardFormItemProps) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging}  = useSortable({id})

  return (
    <div className={cn("bg-background space-y-3 rounded-md border p-3", isDragging && "shadow-xl z-50 cursor-grab relative")} ref={setNodeRef}
    style={{transform: CSS.Transform.toString(transform), transition}}
    >
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Award {index + 1}</span>
        <GripHorizontal className="text-muted-foreground size-5 cursor-grab focus:outline-none"
        {...attributes}
        {...listeners}
         />
      </div>
      
      <FormField
        control={form.control}
        name={`awards.${index}.title`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title of Award</FormLabel>
            <FormControl>
              <Input {...field} placeholder="e.g. Best Developer Award" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name={`awards.${index}.issuer`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Award Issuer</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Who gave you the award"
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`awards.${index}.date`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Award Date</FormLabel>
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
        name={`awards.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Award Description</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder="What were you awarded for"
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