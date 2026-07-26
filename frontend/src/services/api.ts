import { College, CollegeDetailResponse, ChatResponse, CompareResponse, ChatHistoryLog, PaginatedResponse, CollegeBranch } from "../types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

function parsePaginatedData(data: any, fallbackPage: number = 1, fallbackPerPage: number = 20): PaginatedResponse<College> {
  if (data && Array.isArray(data.items)) {
    return {
      items: data.items,
      total: data.total ?? data.items.length,
      page: data.page ?? fallbackPage,
      per_page: data.per_page ?? fallbackPerPage,
      pages: data.pages ?? 1
    };
  }
  if (Array.isArray(data)) {
    return {
      items: data,
      total: data.length,
      page: fallbackPage,
      per_page: fallbackPerPage,
      pages: 1
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

export async function getAllColleges(page: number = 1, perPage: number = 20): Promise<College[]> {
  const paginated = await fetchPaginatedColleges(page, perPage);
  return paginated.items;
}

export async function searchColleges(keyword: string, page: number = 1, perPage: number = 20): Promise<College[]> {
  const paginated = await fetchPaginatedColleges(page, perPage, undefined, keyword);
  return paginated.items;
}

export async function getCollegesByStream(streamName: string, page: number = 1, perPage: number = 20): Promise<College[]> {
  const paginated = await fetchPaginatedColleges(page, perPage, streamName, undefined);
  return paginated.items;
}

export async function getCollegeDetails(id: number | string): Promise<CollegeDetailResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/colleges/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch college details: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getCollegeDetails:", error);
    throw error;
  }
}

export async function getCollegeBranches(collegeId: number): Promise<CollegeBranch[]> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/colleges/${collegeId}/branches`);
    if (!response.ok) {
      throw new Error(`Failed to fetch college branches: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getCollegeBranches:", error);
    return [];
  }
}

export async function compareColleges(collegeIds: number[]): Promise<CompareResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/colleges/compare/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ college_ids: collegeIds }),
    });

    if (!response.ok) {
      throw new Error(`Compare API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in compareColleges:", error);
    throw error;
  }
}

export async function sendChatMessage(
  message: string,
  sessionId?: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in sendChatMessage:", error);
    throw error;
  }
}

export async function getChatHistory(sessionId?: string): Promise<ChatHistoryLog[]> {
  try {
    const url = sessionId
      ? `${BASE_URL}/api/v1/chat/history/?session_id=${encodeURIComponent(sessionId)}`
      : `${BASE_URL}/api/v1/chat/history/`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch chat history: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    return [];
  }
}

export async function deleteChatHistory(logId: string): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/chat/history/${logId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error in deleteChatHistory:", error);
    return false;
  }
}
