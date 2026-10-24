import AsyncStorage from '@react-native-async-storage/async-storage';

// One record per key, plus a light index that carries only what the totals need. Reading a page
// parses the index and that page's records, never the whole history, so the cost of opening a
// screen stays flat as the history grows.
const INDEX_KEY = '@expenses:index';
const LEGACY_KEY = '@expenses';
const recordKey = (id) => `@expense:${id}`;

const indexEntry = (expense) => ({
  id: expense.id,
  amount: Number(expense.amount) || 0,
});

// Histories written before the split read as one JSON array under @expenses. The first read that
// finds one spreads it over the new keys and drops it.
async function loadIndex() {
  const legacy = await AsyncStorage.getItem(LEGACY_KEY);

  if (legacy !== null) {
    const list = JSON.parse(legacy) || [];
    const index = list.map(indexEntry);
    await AsyncStorage.multiSet([
      ...list.map(expense => [recordKey(expense.id), JSON.stringify(expense)]),
      [INDEX_KEY, JSON.stringify(index)],
    ]);
    await AsyncStorage.removeItem(LEGACY_KEY);
    return index;
  }

  const raw = await AsyncStorage.getItem(INDEX_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function readPage(cursor, limit) {
  const index = await loadIndex();
  const at = cursor ? index.findIndex(entry => entry.id === cursor) : -1;

  // The row the cursor named is gone, so the positions it referred to cannot be trusted.
  if (cursor && at === -1) {
    return { items: [], cursor: null, done: true };
  }

  const from = at + 1;
  const slice = index.slice(from, from + limit);
  const stored = await AsyncStorage.multiGet(slice.map(entry => recordKey(entry.id)));
  const byKey = new Map(stored);

  const items = slice
    .map(entry => byKey.get(recordKey(entry.id)))
    .filter(Boolean)
    .map(raw => JSON.parse(raw));

  return {
    items,
    cursor: slice.length > 0 ? slice[slice.length - 1].id : null,
    done: from + limit >= index.length,
  };
}

// The pages behind the window are dropped from memory, so scrolling back up asks for them again.
async function readPageBefore(cursor, limit) {
  const index = await loadIndex();
  const at = index.findIndex(entry => entry.id === cursor);

  if (at <= 0) {
    return { items: [], cursor: null, done: true };
  }

  const from = Math.max(0, at - limit);
  const slice = index.slice(from, at);
  const stored = await AsyncStorage.multiGet(slice.map(entry => recordKey(entry.id)));
  const byKey = new Map(stored);

  const items = slice
    .map(entry => byKey.get(recordKey(entry.id)))
    .filter(Boolean)
    .map(raw => JSON.parse(raw));

  return {
    items,
    cursor: slice.length > 0 ? slice[0].id : null,
    done: from === 0,
  };
}

async function addOne(expense) {
  const index = await loadIndex();
  await AsyncStorage.multiSet([
    [recordKey(expense.id), JSON.stringify(expense)],
    [INDEX_KEY, JSON.stringify([indexEntry(expense), ...index])],
  ]);
}

async function removeMany(ids) {
  const index = await loadIndex();
  const going = new Set(ids);
  await AsyncStorage.multiRemove(ids.map(recordKey));
  await AsyncStorage.setItem(
    INDEX_KEY,
    JSON.stringify(index.filter(entry => !going.has(entry.id)))
  );
}

async function keepOnlyThese(ids) {
  const index = await loadIndex();
  const keep = new Set(ids);
  const going = index.filter(entry => !keep.has(entry.id));
  await AsyncStorage.multiRemove(going.map(entry => recordKey(entry.id)));
  await AsyncStorage.setItem(
    INDEX_KEY,
    JSON.stringify(index.filter(entry => keep.has(entry.id)))
  );
}

// Sweeps by key rather than by index, so a record the index lost track of goes too.
async function removeAll() {
  await loadIndex();
  const keys = await AsyncStorage.getAllKeys();
  await AsyncStorage.multiRemove([
    ...keys.filter(key => key.startsWith('@expense:')),
    INDEX_KEY,
  ]);
}

async function readStats() {
  const index = await loadIndex();
  return {
    count: index.length,
    total: index.reduce((sum, entry) => sum + entry.amount, 0),
  };
}

function run(promise, callback, fallback) {
  promise
    .then(result => callback && callback(result))
    .catch(e => {
      console.log(e);
      if (callback) callback(fallback);
    });
}

export default {
  // callback({ items, cursor, done }); pass the previous cursor to continue.
  page(cursor, limit, callback) {
    run(readPage(cursor, limit), callback, { items: [], cursor: null, done: true });
  },

  // callback({ items, cursor, done }); walks backwards, and `cursor` names the new first row.
  pageBefore(cursor, limit, callback) {
    run(readPageBefore(cursor, limit), callback, { items: [], cursor: null, done: true });
  },

  latest(limit, callback) {
    run(readPage(null, limit).then(result => result.items), callback, []);
  },

  add(expense, callback) {
    run(addOne(expense), callback);
  },

  remove(ids, callback) {
    run(removeMany(ids), callback);
  },

  // Deletes the whole history apart from these, without loading a single record.
  keepOnly(ids, callback) {
    run(keepOnlyThese(ids), callback);
  },

  clear(callback) {
    run(removeAll(), callback);
  },

  // callback({ count, total }); both come from the index, so neither reads a record.
  stats(callback) {
    run(readStats(), callback, { count: 0, total: 0 });
  },
};
