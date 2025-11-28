/**
 * Case Converter Utilities
 * camelCase ↔ snake_case 변환
 */

/**
 * camelCase 객체를 snake_case로 변환
 * @example
 * toSnakeCase({ iceScore: 100, currentRate: 3.2 })
 * // { ice_score: 100, current_rate: 3.2 }
 */
export function toSnakeCase<T extends Record<string, any>>(obj: T): any {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toSnakeCase(item));
  }

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, value]) => value !== undefined)
      .map(([key, value]) => [
        key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
        typeof value === 'object' && value !== null ? toSnakeCase(value) : value
      ])
  );
}

/**
 * snake_case 객체를 camelCase로 변환
 * @example
 * toCamelCase({ ice_score: 100, current_rate: 3.2 })
 * // { iceScore: 100, currentRate: 3.2 }
 */
export function toCamelCase<T extends Record<string, any>>(obj: T): any {
  if (!obj || typeof obj !== 'object' || obj instanceof Date) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }

  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()),
      typeof value === 'object' && value !== null ? toCamelCase(value) : value
    ])
  );
}

/**
 * 특정 키들만 snake_case로 변환 (선택적)
 */
export function toSnakeCaseKeys<T extends Record<string, any>>(
  obj: T,
  keys: string[]
): any {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (keys.includes(key)) {
        return [key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), value];
      }
      return [key, value];
    })
  );
}

