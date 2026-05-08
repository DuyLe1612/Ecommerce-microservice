import { ProfileAddress } from "@/type/address";
import { ApiResponse } from "@/type/share";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export type Profile = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  addresses: Address[];
};

export type Address = {
  id: number;
  recipientName?: string;
  phoneNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  country?: string;
  isDefault?: boolean;
  state: string;
  postalCode: string;
  createdAt: string;
};

export async function getProfile(token: string) : Promise<Profile> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: {
        "Authorization": `Bearer ${token}`,
      },
      
      cache: "no-store",
    });
    const result = await res.json();
    
    return result as Profile; 
  } catch (error) {
    console.error("Error in getProfile:", error);
    throw error;
  }
}

export type UpdateProfileAllPayload = {
  fullname?: string;
  phoneNumber?: string;
  newEmail?: string;
  newPassword?: string;
  confirmPassword?: string;
  currentPassword?: string;
};

export async function updateProfileAll(token: string, payload: UpdateProfileAllPayload): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result?.message || `Request failed: ${res.status}`);
    }
    return result;
  } catch (error) {
    console.error("Error in updateProfileAll:", error);
    throw error;
  }
}


// Address payload (Vietnamese location structure)
export type AddressPayload = {
  recipientName: string;
  phoneNumber: string;
  addressLine: string;
  provinceCode: number;
  provinceName: string;
  districtCode: number;
  districtName: string;
  wardCode: number;
  wardName: string;
  isDefault: boolean;
};

// GET /api/profile/addresses
export async function getProfileAddresses(token: string): Promise<ProfileAddress[]> {
  const res = await fetch(`${API_BASE_URL}/profile/addresses`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to fetch addresses");
  return (json.data ?? json) as ProfileAddress[];
}

// POST /api/profile/addresses
export async function createProfileAddress(
  token: string,
  payload: AddressPayload
): Promise<ApiResponse<ProfileAddress>> {
  const res = await fetch(`${API_BASE_URL}/profile/addresses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw json;
  }

  return json as ApiResponse<ProfileAddress>;
}


// PUT /api/profile/addresses/{addressId}
export async function updateProfileAddress(
  token: string,
  addressId: number,
  payload: AddressPayload
): Promise<ApiResponse<ProfileAddress>> {
  const res = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to update address");
  return (json) as ApiResponse<ProfileAddress>;
}

// DELETE /api/profile/addresses/{addressId}
export async function deleteProfileAddress(
  token: string,
  addressId: number
): Promise<ApiResponse<boolean>> {
  const res = await fetch(`${API_BASE_URL}/profile/addresses/${addressId}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.message || "Failed to delete address");
  return json as ApiResponse<boolean>;
}

// PATCH /api/profile/addresses/{addressId}/default
export async function setDefaultProfileAddress(
  token: string,
  addressId: number
): Promise<ApiResponse<boolean>> {
  const res = await fetch(
    `${API_BASE_URL}/profile/addresses/${addressId}/default`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(json?.message || "Failed to set default address");
  }

  return json as ApiResponse<boolean>;
}

