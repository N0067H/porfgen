import { useState } from "react";

type Props = {
  open: boolean;
  initial?: string;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
};

export default function PromptModal({
  open,
  initial = "",
  onClose,
  onSubmit,
}: Props) {
  const [value, setValue] = useState(initial);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="panel w-[600px] max-w-full p-4 relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Custom prompt (optional)</h3>
          <button onClick={onClose} className="px-2">
            ✕
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full h-40 p-2 panel-2 text-sm"
          placeholder="Write any extra instructions for the portfolio generator"
        />
        <div className="flex justify-end gap-2 mt-2">
          <button className="px-3 py-1" onClick={onClose}>
            Cancel
          </button>
          <button
            className="bg-black text-white px-3 py-1"
            onClick={() => {
              onSubmit(value);
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
