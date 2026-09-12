export interface StockDraft { quantity: number | null; name: string }
export const isStockQuantity = (value: number | null): value is number => value !== null && Number.isInteger(value) && value >= 0 && value <= 2147483647;

/** Save each absolute quantity once; retain failures for an explicit retry. */
export async function saveStockChanges(
  entries: [string, StockDraft][],
  save: (productId: string, quantity: number) => Promise<number>,
  onSaved: (productId: string, quantity: number) => void,
) {
  const failed: { productId: string; name: string; error: string }[] = [];
  let saved = 0;
  for (const [productId, draft] of entries) {
    if (!isStockQuantity(draft.quantity)) {
      failed.push({ productId, name: draft.name, error: 'Укажите целое число от 0 до 2147483647' });
      continue;
    }
    try {
      const quantity = await save(productId, draft.quantity);
      onSaved(productId, quantity); saved++;
    } catch (error) {
      failed.push({ productId, name: draft.name, error: error instanceof Error ? error.message : 'Не удалось сохранить остаток' });
    }
  }
  return { saved, failed };
}
