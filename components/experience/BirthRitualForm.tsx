"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  birthRitualSchema,
  type BirthRitualFormInput,
  type BirthRitualFormValues,
} from "@/lib/validators";
import { useSessionStore } from "@/stores/session.store";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function BirthRitualForm() {
  const router = useRouter();
  const initSession = useSessionStore((state) => state.initSession);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BirthRitualFormInput, unknown, BirthRitualFormValues>({
    resolver: zodResolver(birthRitualSchema),
  });

  const onSubmit = async (values: BirthRitualFormValues) => {
    setSubmitError(null);
    try {
      await initSession(values.firstName, values.day, values.month);
      router.push("/reveal");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex w-full max-w-sm flex-col gap-5"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="firstName" className="text-sm font-medium">
          First name
        </label>
        <input
          id="firstName"
          type="text"
          autoComplete="given-name"
          aria-invalid={!!errors.firstName}
          {...register("firstName")}
          className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
        />
        {errors.firstName && (
          <p className="text-sm text-red-600 dark:text-red-400">{errors.firstName.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="day" className="text-sm font-medium">
            Day
          </label>
          <input
            id="day"
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            placeholder="DD"
            aria-invalid={!!errors.day}
            {...register("day")}
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <label htmlFor="month" className="text-sm font-medium">
            Month
          </label>
          <select
            id="month"
            defaultValue=""
            aria-invalid={!!errors.month}
            {...register("month")}
            className="rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:focus:border-zinc-400"
          >
            <option value="" disabled>
              Select
            </option>
            {MONTHS.map((label, index) => (
              <option key={label} value={index + 1}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {(errors.day || errors.month) && (
        <p className="-mt-3 text-sm text-red-600 dark:text-red-400">
          {errors.day?.message ?? errors.month?.message}
        </p>
      )}

      {submitError && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Finding you…" : "Find My Giantverse Name"}
      </button>
    </form>
  );
}
