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

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${data.clientName.replace(/\s+/g, '_')}_Report_${data.reportMonth.replace(/\s+/g, '_')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
