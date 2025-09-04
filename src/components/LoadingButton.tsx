import { PropagateLoader } from "react-spinners";
import { Button, ButtonProps } from "./ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends ButtonProps{
  loading: boolean;

}


export default function LoadingButton({
    loading,
    disabled,
    className,
    ...props
}: LoadingButtonProps) {
  return <Button disabled={loading || disabled} className={cn("flex items-center gap-2", className)} {...props}>
    {loading && <PropagateLoader color="red" loading={loading} size={20} aria-label="Loading Spinner" data-testid="loader" />}
    {props.children}
  </Button>
}