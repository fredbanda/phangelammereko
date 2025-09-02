import { Metadata } from "next"
import ResumeEditor from "./resume-editor"

export const metadata: Metadata = {
    title: "Create your CV or Resume",
}

export default function EditorPage() {
  return <ResumeEditor />
}