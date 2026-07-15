/**
 * Thin toast helper — cùng look Interior Studio trên mọi trang.
 * Prefer này thay vì alert() / raw toast.
 */
import { toast } from "react-toastify";

const defaults = {
  position: "bottom-right",
  autoClose: 2800,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  theme: "light",
};

export function notifySuccess(message, opts = {}) {
  return toast.success(message, { ...defaults, ...opts });
}

export function notifyError(message, opts = {}) {
  return toast.error(message, { ...defaults, autoClose: 3600, ...opts });
}

export function notifyInfo(message, opts = {}) {
  return toast.info(message, { ...defaults, ...opts });
}

export function notifyWarn(message, opts = {}) {
  return toast.warn(message, { ...defaults, ...opts });
}
