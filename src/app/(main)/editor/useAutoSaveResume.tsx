"use client";

import { ResumeValues } from "@/lib/validations";
import useDebounce from "../../../hooks/useDebounce";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { saveResume } from "@/actions/actions";
import toast from "react-hot-toast";

export default function useAutoSaveResume(resumeData: ResumeValues) {
  const searchParams = useSearchParams();
  const debounceResumeData = useDebounce(resumeData, 1500);
  const [resumeId, setResumeId] = useState(resumeData.id);

  const [lastSavedData, setLastSavedData] = useState(
    structuredClone(resumeData),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [debounceResumeData]);

  useEffect(() => {
    async function save() {
      try {
        setIsSaving(true);
        setError(false);

        const newData = structuredClone(debounceResumeData);
      


        const updatedResume = await saveResume({
          ...newData,
          ...(lastSavedData.photo?.toString() === newData.photo?.toString() && {
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
            `?${newSearchParams.toString()}`,
          );
        }
      } catch (error) {
        setError(true);
        console.error(error);

        toast.error("An error occurred while saving your resume");
      }
    }

    const hasUnsavedChanges =
      JSON.stringify(debounceResumeData) !== JSON.stringify(lastSavedData);

    if (hasUnsavedChanges && !isSaving && debounceResumeData) {
      save();
    }
  }, [debounceResumeData, lastSavedData, isSaving, searchParams, resumeId]);

  return {
    isSaving,
    hasUnsavedChanges:
      JSON.stringify(resumeData) !== JSON.stringify(lastSavedData),
  };
}
