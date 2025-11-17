// components/ui/spinner.tsx
export function Spinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent" />
    </div>
  );
}
