/* eslint-disable prefer-const */
import { BACKEND_URL } from '@/shared/config';
import { createEffect } from 'effector';

interface RequestParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  headers?: Headers;
}

export const requestFx = createEffect(async (params: RequestParams) => {
  let { method, path, body, headers } = params;

  const url = new URL(path, BACKEND_URL);

  if (!headers) {
    headers = new Headers();
  }

  const response = await fetch(url, {
    method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
});
