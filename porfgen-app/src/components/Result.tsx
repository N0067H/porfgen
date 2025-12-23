import React from "react";
import { marked } from "marked";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Props = {
  markdown: string;
};

export default function Result({ markdown }: Props) {
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
    container.innerHTML = marked(markdown);
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
    <div className="mt-6">
      <div className="flex justify-end gap-2 mb-2">
        <button className="px-3 py-1 border" onClick={downloadMarkdown}>
          .MD
        </button>
        <button className="px-3 py-1 bg-black text-white" onClick={downloadPDF}>
          .PDF
        </button>
      </div>
      <div className="panel p-4 max-h-[480px] overflow-auto">
        <pre className="whitespace-pre-wrap">{markdown}</pre>
      </div>
    </div>
  );
}
