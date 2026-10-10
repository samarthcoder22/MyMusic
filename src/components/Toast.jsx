import { Check, X } from "lucide-react";

function Toast({ message, visible, onClose }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="toast">

      <div className="toast-icon">
        <Check size={16} strokeWidth={2.5} />
      </div>

      <div className="toast-content">
        <strong>Done</strong>
        <span>{message}</span>
      </div>

      <button
        className="toast-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        <X size={15} />
      </button>

    </div>
  );
}

export default Toast;