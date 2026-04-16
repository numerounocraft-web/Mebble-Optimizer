declare module "html2pdf.js" {
  interface Options {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: { type?: string; quality?: number };
    html2canvas?: Record<string, unknown>;
    jsPDF?: { unit?: string; format?: string | [number, number]; orientation?: string };
    pagebreak?: { mode?: string | string[] };
  }

  interface Html2Pdf {
    set(options: Options): Html2Pdf;
    from(element: HTMLElement): Html2Pdf;
    save(): Promise<void>;
    output(type: string): Promise<unknown>;
  }

  function html2pdf(): Html2Pdf;
  export default html2pdf;
}
