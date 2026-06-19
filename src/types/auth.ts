export interface LoginLocationState {
  error?: string;
  from?: { pathname: string };
}

export interface EmailFormValues {
  email: string;
}

export interface CodeFormValues {
  code: string;
}
