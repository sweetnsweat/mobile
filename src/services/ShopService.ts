import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

const BASE_URL = API_BASE_URL;

export type ShopCategory = 'character' | 'pass';

export interface ShopItem {
  id: number;
  itemType: string;
  category: ShopCategory;
  name: string;
  description: string | null;
  priceCurrency: number;
  sellable: boolean;
  owned: boolean;
  ownedQuantity: number;
  purchasable: boolean;
  equipped: boolean;
  special: boolean;
  effect: string | null;
  imageUrl: string | null;
  metadata: Record<string, unknown>;
}

export interface ShopItemList {
  items: ShopItem[];
  balanceCurrency: number;
}

export interface PurchaseItemRequest {
  quantity?: number;
}

export interface InventoryItem {
  id: number;
  itemId: number;
  itemType: string;
  name: string;
  description: string | null;
  quantity: number;
  imageUrl: string | null;
  metadata: Record<string, unknown>;
}

export interface PurchaseItemResponse {
  item: InventoryItem;
  balanceCurrency: number;
  transaction: {
    txType: string;
    amount: number;
  };
}

export interface EquipItemResponse {
  item: InventoryItem;
  profileImageUrl: string | null;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

export async function getShopItems(type?: ShopCategory): Promise<ShopItemList> {
  const res = await axios.get<{ data: ShopItemList }>(
    `${BASE_URL}/shop/items`,
    {
      headers: authHeader(),
      params: type ? { type } : undefined,
    },
  );
  return res.data.data;
}

export async function purchaseShopItem(
  itemId: number,
  request: PurchaseItemRequest = { quantity: 1 },
): Promise<PurchaseItemResponse> {
  const res = await axios.post<{ data: PurchaseItemResponse }>(
    `${BASE_URL}/shop/items/${itemId}/purchase`,
    request,
    { headers: authHeader() },
  );
  return res.data.data;
}

export async function equipShopItem(itemId: number): Promise<EquipItemResponse> {
  const res = await axios.post<{ data: EquipItemResponse }>(
    `${BASE_URL}/shop/items/${itemId}/equip`,
    {},
    { headers: authHeader() },
  );
  return res.data.data;
}
