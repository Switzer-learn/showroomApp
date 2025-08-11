import { createClientWithCookies } from "@/app/utils/supabase/clientWithCookies";

/**
 * Generic API error type
 */
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

/**
 * Generic API response type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}

/**
 * Fetch data from Supabase with error handling
 * @param queryFunction - Function that performs the Supabase query
 * @returns API response with data or error
 */
export async function fetchFromSupabase<T>(
  queryFunction: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await queryFunction();
    return { data, success: true };
  } catch (error: any) {
    console.error("API Error:", error);
    return {
      error: {
        message: error.message || "An unexpected error occurred",
        code: error.code,
        status: error.status,
      },
      success: false,
    };
  }
}

/**
 * Insert data to Supabase with error handling
 * @param insertFunction - Function that performs the Supabase insert
 * @returns API response with result or error
 */
export async function insertToSupabase<T>(
  insertFunction: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await insertFunction();
    return { data, success: true };
  } catch (error: any) {
    console.error("Insert Error:", error);
    return {
      error: {
        message: error.message || "Failed to insert data",
        code: error.code,
        status: error.status,
      },
      success: false,
    };
  }
}

/**
 * Update data in Supabase with error handling
 * @param updateFunction - Function that performs the Supabase update
 * @returns API response with result or error
 */
export async function updateInSupabase<T>(
  updateFunction: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await updateFunction();
    return { data, success: true };
  } catch (error: any) {
    console.error("Update Error:", error);
    return {
      error: {
        message: error.message || "Failed to update data",
        code: error.code,
        status: error.status,
      },
      success: false,
    };
  }
}

/**
 * Delete data from Supabase with error handling
 * @param deleteFunction - Function that performs the Supabase delete
 * @returns API response with result or error
 */
export async function deleteFromSupabase<T>(
  deleteFunction: () => Promise<T>
): Promise<ApiResponse<T>> {
  try {
    const data = await deleteFunction();
    return { data, success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return {
      error: {
        message: error.message || "Failed to delete data",
        code: error.code,
        status: error.status,
      },
      success: false,
    };
  }
}
