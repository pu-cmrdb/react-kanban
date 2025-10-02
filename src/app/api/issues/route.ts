import { NextRequest, NextResponse } from 'next/server';

import { validateIssue, validateJsonRequest } from '@/lib/validation';
import { storage } from '@/lib/storage';

export function GET() {
  const issues = storage.getAll();
  return NextResponse.json(issues);
}

export async function POST(request: NextRequest) {
  try {
    validateJsonRequest(request);

    const body = await request.json();
    const issueData = validateIssue(body);

    const newIssue = storage.create(issueData);

    return NextResponse.json(newIssue);
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: '發生未知錯誤' }, { status: 500 });
  }
}
