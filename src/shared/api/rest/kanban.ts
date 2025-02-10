import { PostgrestError } from '@supabase/supabase-js';
import { createEffect } from 'effector';

import { client } from '../client';
import type { Tables } from '../database.types';

/**
 * Документация по именованию эффектов:
 * 
 * listsLoadFx, не loadListsFx и сначала это может быть не привычным и удивительным.
 * Но если присмотреться к опыту, например при подсказках IDE, то видно,
 * что при вводе первой части имени эффекта или функции load<tab> будут отображаться все декларации проекта начинающиеся с load,
 * причем в самом начале списка.
 *
 * Но если все сущности называть в порядке collection-action, при вводе имени коллекции над которой мы хотим провести операцию lists<tab>,
 * в подсказке в начале списка будут как раз действия и свойства.
 * 
 * listsLoadFx()
 * listsCreateFx(listProperties)
 * listsEditFx(editProperties)
 * listsDeleteFx(listsIds)

 * cardsLoadFx()
 * cardsSearchFx(searchQuery)
 * cardsCreateFx(cardProperties)
 * cardsEditFx(editProperties)
 * cardsDeleteFx(cardsIds)
 */

export type List = Tables<'lists'>;
export type ListID = List['id'];
export type ListCreate = Pick<List, 'title'>;

export const listLoadFx = createEffect<void, List[], PostgrestError>(async () => {
  const { data } = await client.from('lists').select('*').throwOnError();
  return data ?? [];
});

export const listCreateFx = createEffect<ListCreate, List | null, PostgrestError>(async (list) => {
  const { data } = await client.from('lists').insert(list).select('*').single().throwOnError();
  return data ?? null;
});

export type Card = Tables<'cards'>;
export type CardID = Card['id'];
export type CardCreate = Omit<Card, 'id' | 'created_at'>;

export const cardsLoadByListIdFx = createEffect<{ listId: ListID }, Card[], PostgrestError>(
  async ({ listId }) => {
    const { data } = await client.from('cards').select('*').eq('list_id', listId).throwOnError();
    return data ?? [];
  },
);

export const cardsLoadFx = createEffect<void, Card[], PostgrestError>(async () => {
  const { data } = await client.from('cards').select('*').throwOnError();
  return data ?? [];
});

export const cardsCreateFx = createEffect<CardCreate, Card | null, PostgrestError>(async (card) => {
  const { data } = await client.from('cards').insert(card).select('*').single().throwOnError();
  return data ?? null;
});
