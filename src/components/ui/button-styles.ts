/**
 * Thin re-export so ButtonLink (and callers) can import styles without the
 * Button component. Delegates to `buttonVariants` / `buttonClassName` in button.tsx.
 */
export {
  buttonClassName,
  buttonVariants,
  type ButtonSize,
  type ButtonVariant,
  type ButtonWidth,
} from "@/components/ui/button";
