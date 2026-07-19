type Listener = (...args: any[]) => void;

class TypedEventEmitter {
  private listeners: Map<string, Listener[]> = new Map();

  on(event: string, listener: Listener): this {
    const list = this.listeners.get(event) || [];
    list.push(listener);
    this.listeners.set(event, list);
    return this;
  }

  off(event: string, listener: Listener): this {
    const list = this.listeners.get(event);
    if (list) {
      const idx = list.indexOf(listener);
      if (idx !== -1) list.splice(idx, 1);
    }
    return this;
  }

  emit(event: string, ...args: unknown[]): boolean {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(fn => fn(...args));
      return true;
    }
    return false;
  }

  removeAllListeners(event?: string): this {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
    return this;
  }
}

export const EventBus = new TypedEventEmitter();
