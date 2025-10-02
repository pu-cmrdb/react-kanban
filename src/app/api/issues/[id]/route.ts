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

export async function PATCH(request: NextRequest) {
  try {
    validateJsonRequest(request);

    const body = await request.json();

    if (!('id' in body) || typeof body.id !== 'string') {
      throw new Error('缺少議題 ID');
    }

    const { id, ...partialData } = body;
    const updatedIssue = storage.patch(id, partialData);

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

export async function DELETE(request: NextRequest) {
  try {
    validateJsonRequest(request);

    const body = await request.json();

    if (!('id' in body) || typeof body.id !== 'number') {
      throw new Error('缺少議題 ID');
    }

    const deleted = storage.delete(body.id);

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
