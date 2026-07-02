"use client";

import { useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type Props = {
  pdfUrl: string;
};

export default function PdfPreview({ pdfUrl }: Props) {
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);

  useEffect(() => {
    if (!containerRef) return;

    const updateWidth = () => {
      setWidth(containerRef.clientWidth);
    };

    updateWidth();

    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef);
    return () => ro.disconnect();
  }, [containerRef]);

  const handleDocumentLoad = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  }, []);

  const prevPage = () => setPageNumber((p) => Math.max(1, p - 1));
  const nextPage = () => setPageNumber((p) => Math.min(numPages, p + 1));

  return (
    <div className="w-full">
      <div ref={setContainerRef} className="rounded-lg shadow-lg border border-border bg-card overflow-hidden">
        <Document
          file={pdfUrl}
          onLoadSuccess={handleDocumentLoad}
          className="flex flex-col items-center"
        >
          {width > 0 && (
            <Page
              renderTextLayer={false}
              renderAnnotationLayer={false}
              pageNumber={pageNumber}
              width={width}
            />
          )}
        </Document>
      </div>

      {numPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            onClick={prevPage}
            disabled={pageNumber <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-muted-foreground">
            Trang <span className="font-semibold text-foreground">{pageNumber}</span> / {numPages}
          </span>
          <button
            onClick={nextPage}
            disabled={pageNumber >= numPages}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
