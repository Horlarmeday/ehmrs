export interface ToastPayload {
  title: string;
  text: string | undefined;
  type: 'success' | 'error';
}

type ToastSink = (payload: ToastPayload) => void;

let sink: ToastSink = () => undefined;

export function setToastSink(next: ToastSink): void {
  sink = next;
}

export const notifySuccess = (response: { data?: { message?: string } }): void => {
  sink({
    title: 'Success message',
    text: response?.data?.message,
    type: 'success',
  });
};

export const notifyError = (error: { response?: { data?: { message?: string } } }): void => {
  sink({
    title: 'Error message',
    text: error?.response?.data?.message,
    type: 'error',
  });
};
