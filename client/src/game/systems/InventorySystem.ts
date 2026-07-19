import type { InventoryItem } from '@shared/types';

export class InventorySystem {
  static addItem(inventory: InventoryItem[], item: InventoryItem): InventoryItem[] {
    const existing = inventory.find(i => i.itemId === item.itemId);

    if (existing) {
      return inventory.map(i =>
        i.itemId === item.itemId
          ? { ...i, quantity: i.quantity + item.quantity }
          : i
      );
    }

    return [...inventory, { ...item, acquiredAt: new Date().toISOString() }];
  }

  static removeItem(inventory: InventoryItem[], itemId: string, quantity: number = 1): InventoryItem[] {
    return inventory
      .map(i =>
        i.itemId === itemId
          ? { ...i, quantity: i.quantity - quantity }
          : i
      )
      .filter(i => i.quantity > 0);
  }

  static hasItem(inventory: InventoryItem[], itemId: string): boolean {
    return inventory.some(i => i.itemId === itemId && i.quantity > 0);
  }

  static getItemCount(inventory: InventoryItem[], itemId: string): number {
    const item = inventory.find(i => i.itemId === itemId);
    return item ? item.quantity : 0;
  }

  static getByType(inventory: InventoryItem[], type: string): InventoryItem[] {
    return inventory.filter(i => i.type === type);
  }
}
