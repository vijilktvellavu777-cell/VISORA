export type PasswordRequirement = {
  id: string;
  label: string;
  test: (password: string) => boolean;
};

export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  {
    id: "length",
    label: "Minimum 12 characters",
    test: (password) => password.length >= 12,
  },
  {
    id: "upper",
    label: "At least one uppercase letter (A–Z)",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lower",
    label: "At least one lowercase letter (a–z)",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "At least one number (0–9)",
    test: (password) => /[0-9]/.test(password),
  },
  {
    id: "special",
    label: "At least one special character (!, @, #, $, etc.)",
    test: (password) => /[^A-Za-z0-9]/.test(password),
  },
];

export function passwordRequirementStatus(password: string) {
  return PASSWORD_REQUIREMENTS.map((requirement) => ({
    id: requirement.id,
    label: requirement.label,
    ok: requirement.test(password),
  }));
}

export function validatePassword(password: string) {
  const failed = PASSWORD_REQUIREMENTS.filter((requirement) => !requirement.test(password));
  return {
    ok: failed.length === 0,
    errors: failed.map((requirement) => requirement.label),
  };
}
