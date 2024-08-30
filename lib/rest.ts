export async function queryGet<T>(path: string) {
  try {
    const res = await window.fetch(path).then((r) => r.json());

    if (!res.success) {
      throw new Error(res.message);
    }

    return res.data as T;
  } catch (err) {
    console.log(err);
    throw err;
  }
}
