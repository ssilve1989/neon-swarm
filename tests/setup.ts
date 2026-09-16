class MemoryStorage implements Storage {
	private store = new Map<string, string>();

	get length() {
		return this.store.size;
	}

	clear() {
		this.store.clear();
	}

	getItem(key: string) {
		const value = this.store.get(key);
		return value === undefined ? null : value;
	}

	key(index: number) {
		return Array.from(this.store.keys())[index] ?? null;
	}

	removeItem(key: string) {
		this.store.delete(key);
	}

	setItem(key: string, value: string) {
		this.store.set(key, String(value));
	}
}

Object.defineProperty(globalThis, "localStorage", {
	value: new MemoryStorage(),
	writable: true,
	configurable: true,
});
