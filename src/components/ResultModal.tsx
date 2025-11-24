import { marked } from "marked";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Props = {
  open: boolean;
  markdown: string;
  onClose: () => void;
};

export default function ResultModal({ open, markdown, onClose }: Props) {
  if (!open) return null;

  const downloadMarkdown = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "portfolio.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    const container = document.createElement("div");
    container.style.width = "800px";
    container.style.padding = "20px";
    container.style.background = "white";
    container.innerHTML = marked.parse(markdown);
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("portfolio.pdf");
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    }

    document.body.removeChild(container);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose} />
      <div className="panel w-[90%] max-w-[900px] max-h-[90vh] overflow-auto p-4 z-10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Generated Portfolio</h3>
          <div className="flex gap-2">
            <button onClick={downloadMarkdown} className="px-3 py-1 border">
              .MD
            </button>
            <button
              onClick={downloadPDF}
              className="px-3 py-1 bg-black text-white"
            >
              .PDF
            </button>
            <button onClick={onClose} className="px-3 py-1">
              Close
            </button>
          </div>
        </div>
        <div className="panel-2 p-3">
          <div dangerouslySetInnerHTML={{ __html: marked.parse(markdown) }} />
        </div>
      </div>
    </div>
  );
}
