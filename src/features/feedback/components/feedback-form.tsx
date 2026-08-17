"use client";

import { useActionState, useRef, useState } from "react";
import {
  submitFeedbackAction,
  type FeedbackActionState,
} from "@/features/feedback/actions";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_CATEGORY_LABELS,
} from "@/features/feedback/lib/validation";
import { Button } from "@/components/ui/button";
import { ChipButton } from "@/components/ui/chip-button";
import { FormField } from "@/components/ui/form-field";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useActionToasts } from "@/hooks/use-action-toasts";

const initial: FeedbackActionState = { status: "success" };

export function FeedbackForm() {
  const [open, setOpen] = useState(false);
  /** Only show fieldErrors after a submit in the current open session. */
  const [showFieldErrors, setShowFieldErrors] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (prev: FeedbackActionState, formData: FormData) => {
      const next = await submitFeedbackAction(prev, formData);
      setShowFieldErrors(Boolean(next.data?.fieldErrors));
      if (next.status === "success") {
        formRef.current?.reset();
        setShowFieldErrors(false);
        setOpen(false);
      }
      return next;
    },
    initial,
  );
  useActionToasts(state);

  function openModal() {
    setShowFieldErrors(false);
    setOpen(true);
  }

  function onClose() {
    if (pending) return;
    setShowFieldErrors(false);
    setOpen(false);
  }

  return (
    <>
      <div className="flex items-center justify-between gap-3 py-2.5">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">Kirim masukan</p>
          <p className="text-xs text-ink-muted">
            Saran, bug, atau catatan lain untuk TrendPlan.
          </p>
        </div>
        <ChipButton variant="ghost" disabled={pending} onClick={openModal}>
          Tulis
        </ChipButton>
      </div>

      <Modal
        open={open}
        onClose={onClose}
        allowClose={!pending}
        title="Kirim masukan"
        size="sm"
      >
        <form ref={formRef} action={action} className="flex flex-col gap-3">
          <FormField
            label="Kategori"
            htmlFor="feedback-category"
            error={showFieldErrors ? state.data?.fieldErrors?.category : undefined}
          >
            <Select
              id="feedback-category"
              name="category"
              defaultValue="saran"
              disabled={pending}
              aria-invalid={Boolean(
                showFieldErrors && state.data?.fieldErrors?.category,
              )}
            >
              {FEEDBACK_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {FEEDBACK_CATEGORY_LABELS[value]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Pesan"
            htmlFor="feedback-message"
            error={showFieldErrors ? state.data?.fieldErrors?.message : undefined}
          >
            <Textarea
              id="feedback-message"
              name="message"
              rows={5}
              maxLength={1000}
              required
              disabled={pending}
              placeholder="Ceritakan saran atau masalahmu (min. 10 karakter)…"
              aria-invalid={Boolean(
                showFieldErrors && state.data?.fieldErrors?.message,
              )}
            />
          </FormField>

          <Button
            type="submit"
            width="full"
            loading={pending}
            loadingText="Mengirim..."
          >
            Kirim
          </Button>
        </form>
      </Modal>
    </>
  );
}
