import { generalInformSchema, GeneralInfoValues } from "@/lib/validations";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useEffect } from "react";
import { EditorFormProps } from "@/utils/types";

export default function GeneralInfoForm({ resumeData, setResumeData }: EditorFormProps) {
  const form = useForm<GeneralInfoValues>({
    resolver: zodResolver(generalInformSchema),
    defaultValues: {
      title: resumeData.title || "",
      description: resumeData.description || "",
    },
  });

    useEffect(() => {
      const { unsubscribe } = form.watch(async (values) => {
        const isValid = await form.trigger();
        if (!isValid) return;
        setResumeData({...resumeData, ...values})
      });
      return unsubscribe;
    }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">General Information</h2>
        <p className="text-muted-foreground text-sm">
          This information will not be displayed on your resume.
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Project Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Sibusiso Zulu CV / Resume" autoFocus />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Project Name</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="For the position of a senior developer at Eunny Tech" autoFocus />
                </FormControl>
                <FormDescription className="italic text-xs">Describes your CV or Resume</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
