import type { GeneralSettings } from "@/lib/general-settings";

export type GeneralSettingsContextValue = {
  form: GeneralSettings;
  setForm: React.Dispatch<React.SetStateAction<GeneralSettings>>;
  save: () => Promise<boolean>;
  message: string | null;
  error: string | null;
  saving: boolean;
  paused: boolean;
  setPaused: (value: boolean) => void;
  pauseLoading: boolean;
  togglePause: () => Promise<void>;
  deleteLoading: boolean;
  deleteConfirm: string;
  setDeleteConfirm: (value: string) => void;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (value: boolean) => void;
  deleteWorkspace: () => Promise<void>;
};
