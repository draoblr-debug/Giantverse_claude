"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createLocalizedBirthRitualSchema,
  type BirthRitualFormInput,
  type BirthRitualFormValues,
} from "@/lib/validators";
import { useSessionStore } from "@/stores/session.store";

export function BirthRitualForm() {
  const router = useRouter();
  const initSession = useSessionStore((state) => state.initSession);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const t = useTranslations("birth");
  const tCommon = useTranslations("common");
  const months = t.raw("months") as string[];

  const schema = useMemo(
    () =>
      createLocalizedBirthRitualSchema({
        firstNameRequired: t("errors.firstNameRequired"),
        firstNameTooLong: t("errors.firstNameTooLong"),
        firstNameLettersOnly: t("errors.firstNameLettersOnly"),
        dayInvalid: t("errors.dayInvalid"),
        monthInvalid: t("errors.monthInvalid"),
        dayMonthMismatch: t("errors.dayMonthMismatch"),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BirthRitualFormInput, unknown, BirthRitualFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: BirthRitualFormValues) => {
    setSubmitError(null);
    try {
      await initSession(values.firstName, values.day, values.month);
      router.push("/choose");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : tCommon("somethingWentWrong"));
    }
  };

  return (
    <div className="form-group">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <ul>
          <li>
            <label className="label-txt" htmlFor="firstName">{t("firstNameLabel")}</label>
            <div className="input-cont">
              <input
                id="firstName"
                type="text"
                autoComplete="given-name"
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
                className="input-txt"
              />
              {errors.firstName && (
                <span className="error-txt">{errors.firstName.message}</span>
              )}
            </div>
          </li>
          <li>
            <label className="label-txt">{t("dateOfBirthLabel")}</label>
            <div className="input-cont" style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <input
                  id="day"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={31}
                  placeholder={t("dayPlaceholder")}
                  aria-invalid={!!errors.day}
                  {...register("day")}
                  className="input-txt"
                />
              </div>
              <div style={{ flex: 1 }}>
                <select
                  id="month"
                  defaultValue=""
                  aria-invalid={!!errors.month}
                  {...register("month")}
                  className="input-txt"
                >
                  <option value="" disabled>{t("monthPlaceholder")}</option>
                  {months.map((label, index) => (
                    <option key={label} value={index + 1}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
            {(errors.day || errors.month) && (
              <div className="input-cont" style={{ marginTop: "5px" }}>
                <span className="error-txt">{errors.day?.message ?? errors.month?.message}</span>
              </div>
            )}
          </li>

          {submitError && (
            <li>
              <div className="input-cont">
                <span className="error-txt">{submitError}</span>
              </div>
            </li>
          )}

          <li className="mb-3">
            {!isSubmitting ? (
              <input type="submit" value={t("submitLabel")} className="btn2 wdth-100p" />
            ) : (
              <div className="btn2-hover wdth-100p" style={{ textAlign: "center", display: "block" }}>
                {t("submittingLabel")}
              </div>
            )}
          </li>
        </ul>
      </form>
    </div>
  );
}
