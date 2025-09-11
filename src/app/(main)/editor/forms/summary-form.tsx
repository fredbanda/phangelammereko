/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { summarySchema, SummaryValues } from "@/lib/validations";
import { EditorFormProps } from "@/utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { generateSummary } from "@/actions/gemini";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Brain, Loader2 } from "lucide-react";
import { PropagateLoader } from "react-spinners";

export default function SummaryForm({
  resumeData,
  setResumeData,
}: EditorFormProps) {
  const form = useForm<SummaryValues>({
    resolver: zodResolver(summarySchema),
    defaultValues: {
      summary: resumeData.summary || "",
    },
  });

  const [loading, setLoading] = useState(false);

  const handleGenerateWithAI = async () => {
    try {
      setLoading(true);
      
      if (!resumeData) {
        toast.error(
          "Please fill all the details about your work experience and qualifications then generate"
        );
        return;
      }

      const response = await generateSummary(`
Generate a professional resume summary of 35 to 75 words for a person with the following details: ${JSON.stringify(
        resumeData,
      )}. 
Begin with a strong statement highlighting the candidate's role, expertise, or unique value (e.g., "Full Stack Web Developer with...," "Experienced Software Engineer specializing in...," or "Versatile developer skilled in..." Keep it changing so as to make sure every summary is unique please). 
Keep the tone professional, concise, and impactful.
`);

      // Update both the form and resume data
      form.setValue("summary", response);
      setResumeData({ ...resumeData, summary: response });
      
      toast.success("Summary generated successfully!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { unsubscribe } = form.watch(async (values) => {
      const isValid = await form.trigger();
      if (!isValid) return;
      setResumeData({ ...resumeData, ...values });
    });
    return unsubscribe;
  }, [form, resumeData, setResumeData]);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1.5 text-center">
        <h2 className="text-2xl font-semibold">Summary</h2>
        <p className="text-muted-foreground text-sm italic">
          Add a summary of your CV or Resume or let AI generate it for you
        </p>
      </div>
      <Form {...form}>
        <form className="space-y-3">
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">Summary</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Summary of your CV or Resume"
                    autoFocus
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleGenerateWithAI}
                  disabled={loading}
                  className="w-full mt-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <PropagateLoader size={18} color="white" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain size={18} className="mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}