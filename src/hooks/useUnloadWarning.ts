import { useEffect } from "react";

export default function useUnloadWarning(condition = true) {
    useEffect(() => {
        if(!condition) return;
        const handleUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        }
        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [condition]);
}