"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Calendar,
  Camera,
  ChevronDown,
  GraduationCap,
  Mail,
  MapPin,
  Shield,
  UserRound,
  Users,
} from "lucide-react";
import { TutoBellLogo } from "@/components/tutobell/logo";

const STEPS = [
  "Basic Information",
  "Teaching Details",
  "Education & Experience",
  "Availability",
  "Review & Submit",
] as const;

const LANGUAGES = ["English", "Hindi", "Malayalam", "Tamil", "Other"] as const;

const PHONE_CODES = [
  { code: "+91", flag: "🇮🇳" },
  { code: "+1", flag: "🇺🇸" },
  { code: "+44", flag: "🇬🇧" },
  { code: "+971", flag: "🇦🇪" },
  { code: "+61", flag: "🇦🇺" },
  { code: "+65", flag: "🇸🇬" },
  { code: "+60", flag: "🇲🇾" },
  { code: "+94", flag: "🇱🇰" },
  { code: "+977", flag: "🇳🇵" },
  { code: "+880", flag: "🇧🇩" },
];

const COUNTRIES = [
  "India",
  "United Arab Emirates",
  "United States",
  "United Kingdom",
  "Australia",
  "Singapore",
  "Malaysia",
  "Sri Lanka",
  "Nepal",
  "Bangladesh",
  "Canada",
  "Germany",
  "France",
  "Qatar",
  "Saudi Arabia",
];

const BENEFITS = [
  {
    title: "Flexible Teaching",
    body: "Set your own schedule and choose your classes.",
    icon: Users,
    wrap: "bg-[#dcfce7] text-[#16a34a]",
  },
  {
    title: "Earn from Your Skills",
    body: "Fair and transparent payments.",
    icon: BarChart3,
    wrap: "bg-[#f3e8ff] text-[#7c3aed]",
  },
  {
    title: "Reach More Students",
    body: "Connect with learners from across locations.",
    icon: GraduationCap,
    wrap: "bg-[#ffedd5] text-[#f97316]",
  },
  {
    title: "Full Support",
    body: "We're with you at every step.",
    icon: Shield,
    wrap: "bg-[#dbeafe] text-[#2563eb]",
  },
];

type Gender = "Female" | "Male" | "Other";

type FormState = {
  fullName: string;
  email: string;
  phoneCode: string;
  mobile: string;
  dateOfBirth: string;
  gender: Gender;
  country: string;
  languages: string[];
  otherLanguage: string;
  bio: string;
};

const INITIAL: FormState = {
  fullName: "",
  email: "",
  phoneCode: "+91",
  mobile: "",
  dateOfBirth: "",
  gender: "Female",
  country: "",
  languages: ["English"],
  otherLanguage: "",
  bio: "",
};

type Errors = Partial<Record<keyof FormState | "photo", string>>;

function validate(form: FormState, photoError: string | null): Errors {
  const errors: Errors = {};
  if (form.fullName.trim().length < 2) errors.fullName = "Enter your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!/^\d{6,15}$/.test(form.mobile.replace(/\s/g, ""))) errors.mobile = "Enter a valid mobile number.";
  if (!form.dateOfBirth) errors.dateOfBirth = "Select your date of birth.";
  else if (form.dateOfBirth > new Date().toISOString().slice(0, 10)) errors.dateOfBirth = "Date of birth must be in the past.";
  if (!form.country) errors.country = "Select your country.";
  if (form.languages.length === 0) errors.languages = "Select at least one language.";
  if (form.languages.includes("Other") && form.otherLanguage.trim().length === 0) {
    errors.otherLanguage = "Enter the other language.";
  }
  if (form.bio.trim().length === 0) errors.bio = "Add a short introduction.";
  if (form.bio.length > 500) errors.bio = "Keep the introduction within 500 characters.";
  if (photoError) errors.photo = photoError;
  return errors;
}

export function TeacherRegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INITIAL);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const nextLabel = useMemo(() => {
    if (step >= STEPS.length - 1) return "Submit";
    return `Next: ${STEPS[step + 1]}`;
  }, [step]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleLanguage(language: string) {
    setForm((current) => {
      const selected = current.languages.includes(language)
        ? current.languages.filter((item) => item !== language)
        : [...current.languages, language];
      return { ...current, languages: selected };
    });
  }

  function onPhoto(file: File | undefined) {
    if (!file) return;
    const allowed = file.type === "image/jpeg" || file.type === "image/png";
    if (!allowed) {
      setPhotoName(null);
      setPhotoError("Use a JPG or PNG file.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoName(null);
      setPhotoError("Photo must be 2 MB or smaller.");
      return;
    }
    setPhotoError(null);
    setPhotoName(file.name);
  }

  function goNext() {
    if (step === 0) {
      const nextErrors = validate(form, photoError);
      setErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;
    }
    if (step >= STEPS.length - 1) {
      setSubmitted(true);
      return;
    }
    setStep((current) => current + 1);
  }

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[400px] shrink-0 flex-col justify-between overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#eaf3ff_100%)] px-9 py-8 lg:flex">
        <div>
          <TutoBellLogo />
          <h1 className="mt-12 text-[2rem] font-extrabold leading-tight text-[#2563eb]">
            Join TutoBell
            <span className="mt-1 block text-[#0f172a]">as a Teacher</span>
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#64748b]">
            Share your knowledge, inspire students and earn from your expertise.
          </p>
          <ul className="mt-8 space-y-5">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="flex gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${benefit.wrap}`}>
                  <benefit.icon size={18} />
                </span>
                <span>
                  <span className="block text-sm font-bold">{benefit.title}</span>
                  <span className="mt-0.5 block text-xs leading-5 text-[#64748b]">{benefit.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <DeskScene />
          <blockquote className="mt-6 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[#475569] shadow-sm">
            <span className="text-2xl leading-none text-[#93c5fd]">“</span>
            Education is not just about teaching, it&apos;s about changing lives.
            <span className="mt-2 block h-1 w-10 rounded-full bg-[#2563eb]" />
          </blockquote>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 sm:px-10">
          <div className="lg:hidden">
            <TutoBellLogo />
          </div>
          <span className="ml-auto text-sm text-[#64748b]">Already have an account?</span>
          <Link
            href="/tutobell/login"
            className="rounded-lg border border-[#2563eb] px-4 py-1.5 text-sm font-semibold text-[#2563eb] hover:bg-[#eff6ff]"
          >
            Log in
          </Link>
        </header>

        <div className="flex-1 px-6 pb-8 sm:px-10">
          <ol className="mx-auto flex max-w-3xl items-start">
            {STEPS.map((label, index) => {
              const active = index === step;
              const done = index < step;
              return (
                <li key={label} className="relative flex flex-1 flex-col items-center text-center">
                  {index > 0 ? (
                    <span className={`absolute right-1/2 top-4 h-px w-full ${done || active ? "bg-[#93c5fd]" : "bg-[#e2e8f0]"}`} />
                  ) : null}
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                      active || done ? "bg-[#2563eb] text-white" : "bg-[#e8eef7] text-[#94a3b8]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className={`mt-2 hidden text-[11px] font-semibold sm:block ${active ? "text-[#2563eb]" : "text-[#94a3b8]"}`}>
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mx-auto mt-8 max-w-4xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {step + 1}. {STEPS[step]}
                </h2>
                <p className="mt-1 text-sm text-[#64748b]">
                  {step === 0
                    ? "Tell us about yourself. This information will be shown on your profile."
                    : step === STEPS.length - 1
                      ? "Check your basic information. The other sections will be added when you send them."
                      : "These details are next. The basic information you entered stays on this form."}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-[#e8f1ff] px-3 py-1 text-xs font-semibold text-[#2563eb]">
                Step {step + 1} of {STEPS.length}
              </span>
            </div>

            {step === 0 ? (
              <BasicInformation
                form={form}
                errors={errors}
                photoName={photoName}
                onChange={update}
                onToggleLanguage={toggleLanguage}
                onPhoto={onPhoto}
              />
            ) : null}

            {step > 0 && step < STEPS.length - 1 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-[#d6e2f5] bg-[#f8fbff] px-6 py-16 text-center">
                <h3 className="text-lg font-bold">{STEPS[step]}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-[#64748b]">
                  Send the fields for this step and they will be added here.
                </p>
              </div>
            ) : null}

            {step === STEPS.length - 1 ? (
              <Review form={form} photoName={photoName} submitted={submitted} />
            ) : null}
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-[#e8eef5] px-6 py-4 sm:px-10">
          {step === 0 ? (
            <Link
              href="/tutobell/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#f8fafc]"
            >
              <ArrowLeft size={16} />
              Cancel
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setStep((current) => current - 1);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-[#e2e8f0] px-4 py-2.5 text-sm font-semibold text-[#334155] hover:bg-[#f8fafc]"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            disabled={submitted}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitted ? "Submitted" : nextLabel}
            <ArrowRight size={16} />
          </button>
        </footer>
      </section>
    </div>
  );
}

function BasicInformation({
  form,
  errors,
  photoName,
  onChange,
  onToggleLanguage,
  onPhoto,
}: {
  form: FormState;
  errors: Errors;
  photoName: string | null;
  onChange: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onToggleLanguage: (language: string) => void;
  onPhoto: (file: File | undefined) => void;
}) {
  return (
    <div className="mt-8 space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full Name" required error={errors.fullName}>
          <IconInput icon={<UserRound size={16} />} error={errors.fullName}>
            <input
              value={form.fullName}
              onChange={(event) => onChange("fullName", event.target.value)}
              placeholder="Enter your full name"
              className={inputClass}
            />
          </IconInput>
        </Field>
        <Field label="Email Address" required error={errors.email}>
          <IconInput icon={<Mail size={16} />} error={errors.email}>
            <input
              type="email"
              value={form.email}
              onChange={(event) => onChange("email", event.target.value)}
              placeholder="Enter your email address"
              className={inputClass}
            />
          </IconInput>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Mobile Number" required error={errors.mobile}>
          <div className="flex gap-2">
            <select
              value={form.phoneCode}
              onChange={(event) => onChange("phoneCode", event.target.value)}
              className="w-[104px] rounded-lg border border-[#e2e8f0] bg-white px-2 text-sm outline-none focus:border-[#2563eb]"
              aria-label="Country code"
            >
              {PHONE_CODES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.flag} {item.code}
                </option>
              ))}
            </select>
            <IconInput icon={<UserRound size={16} />} error={errors.mobile} className="min-w-0 flex-1">
              <input
                inputMode="numeric"
                value={form.mobile}
                onChange={(event) => onChange("mobile", event.target.value)}
                placeholder="Enter your mobile number"
                className={inputClass}
              />
            </IconInput>
          </div>
        </Field>
        <Field label="Date of Birth" required error={errors.dateOfBirth}>
          <IconInput icon={<Calendar size={16} />} error={errors.dateOfBirth}>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(event) => onChange("dateOfBirth", event.target.value)}
              className={`${inputClass} ${form.dateOfBirth ? "text-[#0f172a]" : "text-[#94a3b8]"}`}
            />
          </IconInput>
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">
            Gender <span className="text-[#ef4444]">*</span>
          </legend>
          <div className="flex flex-wrap gap-5 pt-2 text-sm">
            {(["Female", "Male", "Other"] as const).map((gender) => (
              <label key={gender} className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="gender"
                  checked={form.gender === gender}
                  onChange={() => onChange("gender", gender)}
                  className="h-4 w-4 accent-[#2563eb]"
                />
                {gender}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Country" required error={errors.country}>
          <IconInput icon={<MapPin size={16} />} error={errors.country} trailing={<ChevronDown size={16} />}>
            <select
              value={form.country}
              onChange={(event) => onChange("country", event.target.value)}
              className={`${inputClass} appearance-none ${form.country ? "text-[#0f172a]" : "text-[#94a3b8]"}`}
            >
              <option value="">Select your country</option>
              {COUNTRIES.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </IconInput>
        </Field>
      </div>

      <div>
        <div className="text-sm font-semibold">
          Profile Photo <span className="font-medium text-[#94a3b8]">(Optional)</span>
        </div>
        <div className="mt-3 flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-[#cbd5e1] text-[#94a3b8]">
            <Camera size={22} />
          </span>
          <div>
            <label className="inline-flex cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
              Upload Photo
              <input
                type="file"
                accept="image/jpeg,image/png"
                className="sr-only"
                onChange={(event) => onPhoto(event.target.files?.[0])}
              />
            </label>
            <p className="mt-1 text-xs text-[#94a3b8]">{photoName ?? "JPG, PNG - Max 2 MB"}</p>
            {errors.photo ? <p className="mt-1 text-xs text-[#ef4444]">{errors.photo}</p> : null}
          </div>
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">
          Languages You Speak <span className="text-[#ef4444]">*</span>
        </legend>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
          {LANGUAGES.map((language) => (
            <label key={language} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.languages.includes(language)}
                onChange={() => onToggleLanguage(language)}
                className="h-4 w-4 rounded accent-[#2563eb]"
              />
              {language}
            </label>
          ))}
          <input
            value={form.otherLanguage}
            onChange={(event) => onChange("otherLanguage", event.target.value)}
            placeholder="Enter other language"
            className="min-w-[200px] flex-1 rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm outline-none focus:border-[#2563eb]"
          />
        </div>
        {errors.languages ? <p className="mt-1 text-xs text-[#ef4444]">{errors.languages}</p> : null}
        {errors.otherLanguage ? <p className="mt-1 text-xs text-[#ef4444]">{errors.otherLanguage}</p> : null}
      </fieldset>

      <Field label="Short Bio / Introduction" required error={errors.bio}>
        <textarea
          value={form.bio}
          maxLength={500}
          rows={5}
          onChange={(event) => onChange("bio", event.target.value)}
          placeholder="Tell students about yourself, your teaching style and what inspires you to teach..."
          className={`w-full resize-y rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[#2563eb] ${
            errors.bio ? "border-[#ef4444]" : "border-[#e2e8f0]"
          }`}
        />
        <div className="mt-1 text-right text-xs text-[#94a3b8]">{form.bio.length}/500</div>
      </Field>
    </div>
  );
}

function Review({ form, photoName, submitted }: { form: FormState; photoName: string | null; submitted: boolean }) {
  const languages = form.languages.includes("Other")
    ? [...form.languages.filter((language) => language !== "Other"), form.otherLanguage].filter(Boolean).join(", ")
    : form.languages.join(", ");

  return (
    <div className="mt-8 space-y-4">
      {submitted ? (
        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-sm text-[#166534]">
          Basic information is recorded on this page. Teaching details, education, and availability will be added when you send them.
        </div>
      ) : null}
      <dl className="grid gap-4 rounded-2xl border border-[#e8eef5] p-5 sm:grid-cols-2">
        <ReviewItem label="Full name" value={form.fullName} />
        <ReviewItem label="Email" value={form.email} />
        <ReviewItem label="Mobile" value={`${form.phoneCode} ${form.mobile}`} />
        <ReviewItem label="Date of birth" value={form.dateOfBirth} />
        <ReviewItem label="Gender" value={form.gender} />
        <ReviewItem label="Country" value={form.country} />
        <ReviewItem label="Languages" value={languages} />
        <ReviewItem label="Profile photo" value={photoName ?? "Not added"} />
        <div className="sm:col-span-2">
          <ReviewItem label="Short bio" value={form.bio} />
        </div>
      </dl>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">{label}</dt>
      <dd className="mt-1 text-sm text-[#0f172a]">{value}</dd>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label} {required ? <span className="text-[#ef4444]">*</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-[#ef4444]">{error}</span> : null}
    </label>
  );
}

const inputClass = "w-full bg-transparent py-2.5 pr-3 text-sm outline-none placeholder:text-[#94a3b8]";

function IconInput({
  icon,
  error,
  className = "",
  trailing,
  children,
}: {
  icon: React.ReactNode;
  error?: string;
  className?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border bg-white pl-3 ${
        error ? "border-[#ef4444]" : "border-[#e2e8f0] focus-within:border-[#2563eb]"
      } ${className}`}
    >
      <span className="text-[#94a3b8]">{icon}</span>
      {children}
      {trailing ? <span className="pr-3 text-[#94a3b8]">{trailing}</span> : null}
    </div>
  );
}

function DeskScene() {
  return (
    <svg viewBox="0 0 320 150" className="mt-8 w-full" aria-hidden="true">
      <rect x="18" y="108" width="70" height="14" rx="2" fill="#1d4ed8" />
      <rect x="24" y="96" width="58" height="14" rx="2" fill="#3b82f6" />
      <rect x="30" y="84" width="46" height="14" rx="2" fill="#93c5fd" />
      <rect x="108" y="78" width="28" height="44" rx="6" fill="#1e3a8a" />
      <rect x="114" y="70" width="16" height="12" rx="2" fill="#fbbf24" />
      <rect x="112" y="62" width="4" height="12" fill="#f59e0b" />
      <rect x="118" y="58" width="4" height="16" fill="#ef4444" />
      <rect x="124" y="64" width="4" height="10" fill="#22c55e" />
      <ellipse cx="210" cy="118" rx="28" ry="8" fill="#bbf7d0" />
      <rect x="204" y="92" width="12" height="26" rx="4" fill="#16a34a" />
      <ellipse cx="210" cy="88" rx="22" ry="14" fill="#22c55e" />
      <rect x="236" y="86" width="68" height="42" rx="6" fill="#cbd5e1" />
      <rect x="242" y="92" width="56" height="30" rx="3" fill="#e2e8f0" />
      <rect x="258" y="128" width="24" height="4" fill="#94a3b8" />
    </svg>
  );
}
