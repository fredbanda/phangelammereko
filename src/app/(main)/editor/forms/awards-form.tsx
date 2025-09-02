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
import { GripHorizontal } from "lucide-react";
import { useEffect } from "react";
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

export default function AwardForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
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
}

function AwardFormItem({ form, index, remove, id }: AwardFormItemProps) {
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
              <Input {...field} placeholder="e.g Best Developer Award" />
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
                placeholder="What were you awarded for "
                autoFocus
              />
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
                type="month" // ✅ only month + year
                placeholder="Start Date e.g. 2022-01"
                value={field.value?.slice(0, 7) || ""} // ✅ store YYYY-MM
                onChange={(e) => field.onChange(e.target.value)} // ✅ ensure update
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Button variant="destructive" type="button" onClick={() => remove(index)}>
        Remove
      </Button>
    </div>
  );
}
