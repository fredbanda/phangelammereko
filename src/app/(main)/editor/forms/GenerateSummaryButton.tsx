import { ResumeValues } from "@/lib/validations"
import { toast } from "sonner";
import { useState } from "react";
import LoadingButton from "@/components/LoadingButton";
import { WandSparklesIcon } from "lucide-react";
import { set } from "zod";
import { generateSummaryGemini } from "./actions";

interface GenerateSummaryButtonProps {
    resumeData: ResumeValues;
    onGenerateSummary: (resumeData: ResumeValues) => void;
}

export default function GenerateSummaryButton({ resumeData, onGenerateSummary }: GenerateSummaryButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleClick(){
        try {
            setLoading(true);
            const summary = await generateSummaryGemini(resumeData);
            onGenerateSummary({
                ...resumeData,
                summary,
            });
        } catch (error) {
            console.error(error);
            toast.error("Could not generate summary", {
                style: {
                    background: "var(--destructive)",
                },
            });
        }finally{
            setLoading(false);
        }

    }

  return <LoadingButton
    loading={loading}
    onClick={handleClick}
    disabled={loading}
  >
    <WandSparklesIcon className="size-4" />
    Generate With AI
  </LoadingButton>
}