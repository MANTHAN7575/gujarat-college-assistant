import { College, CollegeDetailResponse, ChatResponse, CompareResponse, ChatHistoryLog, PaginatedResponse, CollegeBranch } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function parsePaginatedData(data: any, fallbackPage: number = 1, fallbackPerPage: number = 20): PaginatedResponse<College> {
  if (data && Array.isArray(data.items)) {
    const total = data.total ?? data.total_count ?? data.items.length;
    const perPage = data.per_page ?? data.limit ?? fallbackPerPage;
    const pages = data.pages ?? Math.max(1, Math.ceil(total / perPage));
    return {
      items: data.items,
      total: total,
      page: data.page ?? fallbackPage,
      per_page: perPage,
      pages: pages
    };
  }
  if (data && (Array.isArray(data.colleges) || Array.isArray(data.data))) {
    const items = data.colleges || data.data;
    const total = data.total ?? data.total_count ?? items.length;
    const perPage = data.per_page ?? data.limit ?? fallbackPerPage;
    const pages = data.pages ?? Math.max(1, Math.ceil(total / perPage));
    return {
      items: items,
      total: total,
      page: data.page ?? fallbackPage,
      per_page: perPage,
      pages: pages
    };
  }
  if (Array.isArray(data)) {
    const total = data.length;
    const pages = Math.max(1, Math.ceil(total / fallbackPerPage));
    return {
      items: data,
      total: total,
      page: fallbackPage,
      per_page: fallbackPerPage,
      pages: pages
    };
  }
  return {
    items: [],
    total: 0,
    page: fallbackPage,
    per_page: fallbackPerPage,
    pages: 1
  };
}

export async function fetchPaginatedColleges(
  page: number = 1,
  perPage: number = 20,
  stream?: string,
  search?: string
): Promise<PaginatedResponse<College>> {
  try {
    let url = `${BASE_URL}/api/v1/colleges/`;
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("per_page", String(perPage));

    if (search && search.trim()) {
      url = `${BASE_URL}/api/v1/colleges/search`;
      params.append("keyword", search.trim());
    } else if (stream && stream.toLowerCase() !== "all") {
      url = `${BASE_URL}/api/v1/colleges/stream/${encodeURIComponent(stream)}`;
    }

    const response = await fetch(`${url}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    }
    const data = await response.json();
    return parsePaginatedData(data, page, perPage);
  } catch (error) {
    console.error("Error in fetchPaginatedColleges:", error);
    throw error;
  }
}

export const searchColleges = fetchPaginatedColleges;

export async function getAllColleges(): Promise<College[]> {
  try {
    const res = await fetchPaginatedColleges(1, 100);
    return res.items;
  } catch (error) {
    console.error("Error fetching all colleges:", error);
    return [];
  }
}

export async function getCollegeDetails(id: number | string): Promise<CollegeDetailResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/colleges/${id}`);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

export async function getCollegeBranches(collegeId: number): Promise<CollegeBranch[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/colleges/${collegeId}/branches`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching college branches:", error);
    return [];
  }
}

export async function compareColleges(collegeIds: number[]): Promise<CompareResponse> {
  const params = new URLSearchParams();
  collegeIds.forEach((id) => params.append("college_ids", String(id)));

  const response = await fetch(`${BASE_URL}/api/v1/colleges/compare?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

export async function sendChatMessage(query: string, sessionId?: string): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/api/v1/chat/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      session_id: sessionId || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return await response.json();
}

export async function getChatHistory(sessionId: string): Promise<ChatHistoryLog[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/chat/history/${sessionId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

export async function deleteChatHistory(sessionId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/chat/history/${sessionId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting chat history:", error);
    return false;
  }
}
