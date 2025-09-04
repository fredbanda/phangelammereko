import { saveResume } from "@/actions/actions";
import { Button } from "@/components/ui/button";
import useDebounce from "@/hooks/useDebounce";
import { fileReplacer } from "@/lib/utils";
import { ResumeValues } from "@/lib/validations";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

export default function useAutoSaveResume(resumeData: ResumeValues) {
  const { user, isLoaded } = useUser(); // Clerk user
  const searchParams = useSearchParams();
  
  const debouncedResumeData = useDebounce(resumeData, 1500);
  
  const [resumeId, setResumeId] = useState(resumeData.id);
  const [lastSavedData, setLastSavedData] = useState(structuredClone(resumeData));
  
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    setIsError(false);
  }, [debouncedResumeData]);
  
  useEffect(() => {
    // Only proceed if Clerk has finished loading
    if (!isLoaded) return;
    
    // If no user is logged in, skip autosave but don't error
    if (!user) return;
    
    async function save() {
      try {
        setIsSaving(true);
        setIsError(false);
        
        const newData = structuredClone(debouncedResumeData);
        
        const updatedResume = await saveResume({
          ...newData,
          ...(JSON.stringify(lastSavedData.photo, fileReplacer) ===
            JSON.stringify(newData.photo, fileReplacer) && {
            photo: undefined,
          }),
          id: resumeId,
        });
        
        setResumeId(updatedResume.id);
        setLastSavedData(newData);
        
        if (searchParams.get("resumeId") !== updatedResume.id) {
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.set("resumeId", updatedResume.id);
          window.history.replaceState(
            null,
            "",
            `?${newSearchParams.toString()}`
          );
        }
      } catch (error) {
        setIsError(true);
        console.error(error);
        
        toast.error(
          <div className="space-y-3">
            <p>Could not save changes.</p>
            <Button
              variant="secondary"
              onClick={() => {
                toast.dismiss();
                save();
              }}
              size="sm"
            >
              Retry
            </Button>
          </div>,
          { duration: Infinity }
        );
      } finally {
        setIsSaving(false);
      }
    }
    
    const hasUnsavedChanges =
      JSON.stringify(debouncedResumeData) !==
      JSON.stringify(lastSavedData, fileReplacer);
    
    if (hasUnsavedChanges && debouncedResumeData && !isSaving && !isError) {
      save();
    }
  }, [debouncedResumeData, isSaving, lastSavedData, isError, resumeId, searchParams, user, isLoaded]);
  
  return {
    isSaving: user ? isSaving : false, // Don't show saving when not logged in
    hasUnsavedChanges: user 
      ? JSON.stringify(resumeData) !== JSON.stringify(lastSavedData)
      : false, // No unsaved changes when not logged in
  };
}