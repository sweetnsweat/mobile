import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import { getStoredAuth } from './AuthService';

export type ShopCategory = 'character' | 'pass';

export interface ShopItem {
  id: number;
  itemType: string;
  category: ShopCategory | string;
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

export interface ShopItemListResponse {
  items: ShopItem[];
  balanceCurrency: number;
}

export interface PurchasedItem {
  itemId: number;
  itemType: string;
  name: string;
  quantity: number;
  imageUrl: string | null;
}

export interface ShopPurchaseResponse {
  item: PurchasedItem;
  balanceCurrency: number;
  transaction: {
    txType: string;
    amount: number;
  };
}

export interface ShopEquipResponse {
  item: PurchasedItem;
  profileImageUrl: string | null;
}

function authHeader(): Record<string, string> {
  const auth = getStoredAuth();
  if (!auth?.accessToken) throw new Error('로그인이 필요합니다.');
  return { Authorization: `Bearer ${auth.accessToken}` };
}

function errorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string; message?: string } | undefined;
    return data?.detail || data?.message || fallback;
  }
  return fallback;
}

export async function getShopItems(type?: ShopCategory | string): Promise<ShopItemListResponse> {
  try {
    const response = await axios.get<{ data: ShopItemListResponse }>(
      `${API_BASE_URL}/shop/items`,
      {
        headers: authHeader(),
        params: type ? { type } : undefined,
      },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(errorMessage(error, '상점 목록을 불러오지 못했습니다.'));
  }
}

export async function purchaseShopItem(itemId: number, quantity = 1): Promise<ShopPurchaseResponse> {
  try {
    const response = await axios.post<{ data: ShopPurchaseResponse }>(
      `${API_BASE_URL}/shop/items/${itemId}/purchase`,
      { quantity },
      { headers: authHeader() },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(errorMessage(error, '아이템 구매에 실패했습니다.'));
  }
}

export async function equipShopItem(itemId: number): Promise<ShopEquipResponse> {
  try {
    const response = await axios.post<{ data: ShopEquipResponse }>(
      `${API_BASE_URL}/shop/items/${itemId}/equip`,
      {},
      { headers: authHeader() },
    );
    return response.data.data;
  } catch (error) {
    throw new Error(errorMessage(error, '아이템 적용에 실패했습니다.'));
  }
}
