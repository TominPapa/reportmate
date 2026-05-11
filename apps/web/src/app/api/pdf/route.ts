import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { ReportPDF, PDFReportData } from '@/components/ReportPDF';
import React from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyReactElement = any;

export async function POST(req: NextRequest) {
  try {
    const data: PDFReportData = await req.json();
    const element: AnyReactElement = React.createElement(ReportPDF, { data });
    const buffer = await renderToBuffer(element);

    // HTTP headers must be ASCII. Use RFC 5987 encoding for non-ASCII (Korean) filenames.
    const rawFilename = `${data.clientName.replace(/\s+/g, '_')}_Report_${data.reportMonth.replace(/\s+/g, '_')}.pdf`;
    const asciiFilename = rawFilename.replace(/[^\x20-\x7E]/g, '_'); // fallback for old browsers
    const encodedFilename = encodeURIComponent(rawFilename);         // RFC 5987

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${asciiFilename}"; filename*=UTF-8''${encodedFilename}`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('PDF generation error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
