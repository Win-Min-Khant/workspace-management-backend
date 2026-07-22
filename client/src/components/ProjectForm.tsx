import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectSchema, type ProjectInputs } from "@/schema/Project";

interface ProjectFormProps {
  defaultValues?: ProjectInputs;
  onSubmit: (data: ProjectInputs) => void;
  isPending: boolean;
  submitLabel: string;
}

function ProjectForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel,
}: ProjectFormProps) {
  const form = useForm<ProjectInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
      status: "planning",
      startDate: "",
      endDate: "",
    },
  });

  return (
    <>
      <form id="project-form" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="project-name">Project name</FieldLabel>
                <Input
                  {...field}
                  id="project-name"
                  placeholder="Website redesign"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="project-description">
                  Description
                </FieldLabel>
                <Input
                  {...field}
                  id="project-description"
                  placeholder="What's this project about?"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="project-status">Status</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="project-status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="project-start">Start date</FieldLabel>
                  <Input {...field} id="project-start" type="date" />
                </Field>
              )}
            />
            <Controller
              name="endDate"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="project-end">End date</FieldLabel>
                  <Input {...field} id="project-end" type="date" />
                </Field>
              )}
            />
          </div>
        </FieldGroup>
      </form>

      <Button
        type="submit"
        form="project-form"
        className="w-full mt-4 cursor-pointer"
        disabled={isPending}
      >
        {isPending ? "Saving..." : submitLabel}
      </Button>
    </>
  );
}

export default ProjectForm;
