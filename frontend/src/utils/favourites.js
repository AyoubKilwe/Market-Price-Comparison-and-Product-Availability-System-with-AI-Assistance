import { useEffect, useState } from 'react';

export const PRODUCT_FAVOURITES_KEY = 'marketeye_favourite_product_ids';
export const SHOP_FAVOURITES_KEY = 'marketeye_favourite_shop_ids';
const CHANGE_EVENT = 'marketeye:favourites-changed';

const readIds = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? [...new Set(value.filter((id) => typeof id === 'string' && id))] : [];
  } catch { return []; }
};

export const getFavouriteIds = (type) => readIds(type === 'product' ? PRODUCT_FAVOURITES_KEY : SHOP_FAVOURITES_KEY);

export const setFavouriteIds = (type, ids) => {
  const key = type === 'product' ? PRODUCT_FAVOURITES_KEY : SHOP_FAVOURITES_KEY;
  const cleanIds = [...new Set(ids.filter((id) => typeof id === 'string' && id))];
  localStorage.setItem(key, JSON.stringify(cleanIds));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  return cleanIds;
};

export const toggleFavourite = (type, id) => {
  const ids = getFavouriteIds(type);
  return setFavouriteIds(type, ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]);
};

export function useFavouriteIds(type) {
  const [ids, setIds] = useState(() => getFavouriteIds(type));
  useEffect(() => {
    const update = () => setIds(getFavouriteIds(type));
    window.addEventListener(CHANGE_EVENT, update);
    window.addEventListener('storage', update);
    return () => { window.removeEventListener(CHANGE_EVENT, update); window.removeEventListener('storage', update); };
  }, [type]);
  return ids;
}
