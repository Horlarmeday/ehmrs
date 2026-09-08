/**
 * Toast adapter — frozen port of legacy `client/src/common/common.js`
 * notifySuccess/notifyError. Content is frozen (titles, text source, type);
 * only the chrome changed: legacy vue-notification `group: 'foo'` is replaced
 * by PrimeVue ToastService, registered as a sink by the app shell
 * (`App.vue`). Before registration the sink is a no-op so stores/tests can
 * import this module without an app context.
 */
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
