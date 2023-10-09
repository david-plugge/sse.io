export class SetMap<K, V> {
	private readonly map = new Map<K, Set<V>>();

	add(key: K, value: V) {
		let set = this.map.get(key);
		if (!set) {
			this.map.set(key, (set = new Set()));
		}
		set.add(value);
	}
	delete(key: K, value?: V) {
		if (typeof value === 'undefined') {
			return this.map.delete(key);
		} else {
			return this.map.get(key)?.delete(value);
		}
	}
	get(key: K) {
		return this.map.get(key);
	}
	has(key: K, value?: V) {
		if (typeof value === 'undefined') {
			return this.map.has(key);
		} else {
			return !!this.map.get(key)?.has(value);
		}
	}
}
