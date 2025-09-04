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
import { certificationSchema, CertificationValues } from "@/lib/validations";
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

export default function CertificationsForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<CertificationValues>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      certifications: resumeData.certifications || [],
    },
  });

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({
        ...resumeData,
        certifications:
          values.certifications?.filter((cert) => cert !== undefined) || [],
      });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "certifications",
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
        <h2 className="text-2xl font-semibold">Certifications</h2>
        <p className="text-muted-foreground text-sm italic">
          Please add any of your professional certifications
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
                <CertificationFormItem
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
                  body: "",
                  certification: "",
                  year: "",
                })
              }
            >
              Add Certification
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}

interface CertificationFormItemProps {
  id: string;
  form: UseFormReturn<CertificationValues>;
  index: number;
  remove: (index: number) => void;
}

function CertificationFormItem({
  id,
  form,
  index,
  remove,
}: CertificationFormItemProps) {

    const {attributes, listeners, setNodeRef, transform, transition, isDragging}  = useSortable({id})


  return (
       <div className={cn("bg-background space-y-3 rounded-md border p-3", isDragging && "shadow-xl z-50 cursor-grab relative")} ref={setNodeRef}
    style={{transform: CSS.Transform.toString(transform), transition}}
    >
      <div className="flex justify-between gap-2">
        <span className="font-semibold">Certifications {index + 1}</span>
        <GripHorizontal className="text-muted-foreground size-5 cursor-grab
        focus:outline-none" 
        {...attributes}
        {...listeners}
        />
      </div>
      <FormField
        control={form.control}
        name={`certifications.${index}.body`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Certifying Body</FormLabel>
            <FormControl>
              <Input {...field} value={field.value ?? ""} placeholder="e.g AWS" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`certifications.${index}.certification`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Certification Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                value={field.value ?? ""}
                placeholder="Your qualification e.g. Bachelor of Engineering"
                autoFocus
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`certifications.${index}.year`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Certification Year</FormLabel>
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
