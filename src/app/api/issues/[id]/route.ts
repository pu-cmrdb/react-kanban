import { NextRequest, NextResponse } from 'next/server';

import { validateIssue, validateJsonRequest } from '@/lib/validation';
import { storage } from '@/lib/storage';

export async function PUT(request: NextRequest, context: RouteContext<'/api/issues/[id]'>) {
  const { id } = await context.params;

  try {
    validateJsonRequest(request);

    const body = await request.json();
    const issueData = validateIssue(body);

    const updatedIssue = storage.update(id, issueData);

    if (!updatedIssue) throw new Error('議題不存在');

    return NextResponse.json(updatedIssue);
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: '發生未知錯誤' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext<'/api/issues/[id]'>) {
  const { id } = await context.params;

  try {
    validateJsonRequest(request);

    const body = await request.json();

    const updatedIssue = storage.patch(id, body);

    if (!updatedIssue) throw new Error('議題不存在');

    return NextResponse.json(updatedIssue);
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: '發生未知錯誤' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext<'/api/issues/[id]'>) {
  const { id } = await context.params;

  try {
    const deleted = storage.delete(id);

    if (!deleted) throw new Error('議題不存在');

    return NextResponse.json({ success: true });
  }
  catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: '發生未知錯誤' }, { status: 500 });
  }
}
