import { toast } from "sonner";

export const COPY_TOAST_ID = "planner-copy";

export function copyToastSuccess(message: string) {
  toast.success(message, { id: COPY_TOAST_ID });
}

export function copyToastError(message: string) {
  toast.error(message, { id: COPY_TOAST_ID });
}
