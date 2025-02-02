// Пример работы с API
import { createEffect } from 'effector';

import { requestFx } from '../request';

export const cardsListFx = createEffect(() => {
  return requestFx({ method: 'GET', path: '/cards' });
});

interface CardCreateParams {
  name: string;
  description: string;
}

export const cardsCreateFx = createEffect((body: CardCreateParams) => {
  return requestFx({ method: 'POST', path: '/cards', body });
});
