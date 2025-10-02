import { NextRequest } from 'next/server';

export function validateJsonRequest(request: NextRequest) {
  if (
    request.headers.get('Content-Type') !== 'application/json'
    || request.headers.get('Content-Length') === '0'
  ) throw new Error('無效的請求');
}

export function validateIssue(data: unknown) {
  if (
    typeof data !== 'object'
    || data === null
    || !('title' in data)
    || !('description' in data)
    || !('status' in data)
  ) throw new Error('無效的議題資料');

  return data as { title: string; description: string; status: string };
}
