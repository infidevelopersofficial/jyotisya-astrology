/**
 * Tests for PATCH /api/user/kundli - Toggle Favorite
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock Prisma
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    kundli: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { PATCH } from "@/app/api/user/kundli/route";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";

describe("PATCH /api/user/kundli - Toggle Favorite", () => {
  const mockUser = {
    id: "user-123",
    email: "test@example.com",
  };

  const mockKundli = {
    id: "kundli-456",
    userId: "user-123",
    isFavorite: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should toggle favorite from false to true", async () => {
    // Mock authentication
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    // Mock database queries
    vi.mocked(prisma.kundli.findUnique).mockResolvedValue(mockKundli as any);
    vi.mocked(prisma.kundli.update).mockResolvedValue({
      id: "kundli-456",
      isFavorite: true,
    } as any);

    const request = new NextRequest("http://localhost:3000/api/user/kundli?id=kundli-456", {
      method: "PATCH",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isFavorite).toBe(true);

    expect(prisma.kundli.update).toHaveBeenCalledWith({
      where: { id: "kundli-456" },
      data: { isFavorite: true },
      select: { id: true, isFavorite: true },
    });
  });

  it("should toggle favorite from true to false", async () => {
    // Mock authentication
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    // Mock database queries with isFavorite: true
    vi.mocked(prisma.kundli.findUnique).mockResolvedValue({
      ...mockKundli,
      isFavorite: true,
    } as any);
    vi.mocked(prisma.kundli.update).mockResolvedValue({
      id: "kundli-456",
      isFavorite: false,
    } as any);

    const request = new NextRequest("http://localhost:3000/api/user/kundli?id=kundli-456", {
      method: "PATCH",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.isFavorite).toBe(false);

    expect(prisma.kundli.update).toHaveBeenCalledWith({
      where: { id: "kundli-456" },
      data: { isFavorite: false },
      select: { id: true, isFavorite: true },
    });
  });

  it("should return 401 if user is not authenticated", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
          error: new Error("Not authenticated"),
        }),
      },
    } as any);

    const request = new NextRequest("http://localhost:3000/api/user/kundli?id=kundli-456", {
      method: "PATCH",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if kundli ID is missing", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    const request = new NextRequest("http://localhost:3000/api/user/kundli", {
      method: "PATCH",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Kundli ID is required");
  });

  it("should return 404 if kundli does not exist", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    vi.mocked(prisma.kundli.findUnique).mockResolvedValue(null);

    const request = new NextRequest("http://localhost:3000/api/user/kundli?id=kundli-456", {
      method: "PATCH",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("Chart not found");
  });

  it("should return 403 if user does not own the kundli", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    // Mock kundli owned by different user
    vi.mocked(prisma.kundli.findUnique).mockResolvedValue({
      ...mockKundli,
      userId: "different-user-id",
    } as any);

    const request = new NextRequest("http://localhost:3000/api/user/kundli?id=kundli-456", {
      method: "PATCH",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toBe("Forbidden");
  });

  it("should return 500 if database update fails", async () => {
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);

    vi.mocked(prisma.kundli.findUnique).mockResolvedValue(mockKundli as any);
    vi.mocked(prisma.kundli.update).mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/user/kundli?id=kundli-456", {
      method: "PATCH",
    });

    const response = await PATCH(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Failed to toggle favorite");
  });
});
