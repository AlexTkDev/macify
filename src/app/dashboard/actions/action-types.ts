export type ApplicationFormState = {
  message?: string;
  errors?: Record<string, string[]>;
};

export type MediaUploadState = {
  message?: string;
  success?: boolean;
};

export type PublicationState = {
  message?: string;
};
