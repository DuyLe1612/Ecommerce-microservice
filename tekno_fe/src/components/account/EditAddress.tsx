"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ProfileAddress } from "@/type/address";
import { Province, District, Ward } from "@/type/location";
import { getProvinces, getDistricts, getWards } from "@/services/location";
import {
  AddressPayload,
  updateProfileAddress,
} from "@/services/profile";

type Props = {
  address: ProfileAddress;
  onUpdated?: () => void;
  onClose?: () => void;
};

export default function EditAddress({
  address,
  onUpdated,
  onClose,
}: Props) {
  /* ---------------- STATE ---------------- */

  const [recipientName, setRecipientName] = useState(
    address.recipientName ?? ""
  );
  const [phoneNumber, setPhoneNumber] = useState(
    address.phoneNumber ?? ""
  );
  const [addressLine, setAddressLine] = useState(
    (address as any).addressLine ??
      (address as any).addressLine1 ??
      ""
  );
  const [isDefault, setIsDefault] = useState<boolean>(
    !!address.isDefault
  );

  const [provinceCode, setProvinceCode] = useState<number | undefined>(
    (address as any).provinceCode ??
      (address as any).provinceId
  );
  const [districtCode, setDistrictCode] = useState<number | undefined>(
    (address as any).districtCode ??
      (address as any).districtId
  );
  const [wardCode, setWardCode] = useState<number | undefined>(
    (address as any).wardCode ??
      (address as any).wardId
  );

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const ps = await getProvinces();
        setProvinces(ps);
      } catch (e: any) {
        toast.error(e?.message || "Không tải được tỉnh/thành");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!provinceCode) {
      setDistricts([]);
      setDistrictCode(undefined);
      setWards([]);
      setWardCode(undefined);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const ds = await getDistricts(provinceCode);
        setDistricts(ds);

        if (districtCode && !ds.some((d) => d.code === districtCode)) {
          setDistrictCode(undefined);
          setWards([]);
          setWardCode(undefined);
        }
      } catch (e: any) {
        toast.error(e?.message || "Không tải được quận/huyện");
      } finally {
        setLoading(false);
      }
    })();
  }, [provinceCode]);

  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      setWardCode(undefined);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const ws = await getWards(districtCode);
        setWards(ws);

        if (wardCode && !ws.some((w) => w.code === wardCode)) {
          setWardCode(undefined);
        }
      } catch (e: any) {
        toast.error(e?.message || "Không tải được phường/xã");
      } finally {
        setLoading(false);
      }
    })();
  }, [districtCode]);

  /* ---------------- VALIDATION ---------------- */

  const canSubmit = useMemo(
    () =>
      recipientName.trim() &&
      phoneNumber.trim() &&
      addressLine.trim() &&
      provinceCode &&
      districtCode &&
      wardCode,
    [
      recipientName,
      phoneNumber,
      addressLine,
      provinceCode,
      districtCode,
      wardCode,
    ]
  );

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Thiếu token");

      const provinceName =
        provinces.find((p) => p.code === provinceCode)?.name || "";
      const districtName =
        districts.find((d) => d.code === districtCode)?.name || "";
      const wardName =
        wards.find((w) => w.code === wardCode)?.name || "";

      const payload: AddressPayload = {
        recipientName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        addressLine: addressLine.trim(),

        provinceCode: provinceCode!,
        provinceName,

        districtCode: districtCode!,
        districtName,

        wardCode: wardCode!,
        wardName,

        isDefault,
      };

      await updateProfileAddress(
        token,
        Number(address.id),
        payload
      );

      toast.success("Cập nhật thành công");
      onUpdated?.();
      onClose?.();
    } catch (e: any) {
      toast.error(e?.message || "Cập nhật thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  /* ---------------- UI ---------------- */

  const inputClass =
    "border rounded-xl px-4 py-3 text-sm bg-[#1a1a1a] text-white focus:outline-none focus:ring-1 border-gray-800 focus:border-primary/50 focus:ring-primary/50 transition-all";

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[#111111]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Recipient Name">
            <input
              className={inputClass}
              value={recipientName}
              onChange={(e) =>
                setRecipientName(e.target.value)
              }
              placeholder="E.g., John Doe"
            />
          </Field>

          <Field label="Phone Number">
            <input
              className={inputClass}
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
              placeholder="E.g., +84 123 456 789"
            />
          </Field>

          <Select
            label="Province / City"
            value={provinceCode}
            options={provinces}
            disabled={loading}
            onChange={setProvinceCode}
          />

          <Select
            label="District"
            value={districtCode}
            options={districts}
            disabled={!provinceCode || loading}
            onChange={setDistrictCode}
          />

          <Select
            label="Ward / Commune"
            value={wardCode}
            options={wards}
            disabled={!districtCode || loading}
            onChange={setWardCode}
          />

          <div className="flex items-center gap-3 md:col-span-2 mt-2">
            <input
              type="checkbox"
              id="isDefaultEdit"
              className="w-4 h-4 rounded border-gray-600 bg-[#1a1a1a] text-primary focus:ring-primary focus:ring-offset-[#111111] cursor-pointer"
              checked={isDefault}
              onChange={(e) =>
                setIsDefault(e.target.checked)
              }
            />
            <label htmlFor="isDefaultEdit" className="text-sm text-gray-300 cursor-pointer select-none">
              Set as default address
            </label>
          </div>

          <Field label="Detail Address" colSpan>
            <input
              className={inputClass}
              value={addressLine}
              onChange={(e) =>
                setAddressLine(e.target.value)
              }
              placeholder="House number, Street name..."
            />
          </Field>
        </div>

        <div className="flex gap-4 justify-end pt-4 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="px-6 py-2.5 rounded-xl bg-primary text-black text-sm font-bold disabled:bg-gray-800 disabled:text-gray-500 hover:bg-yellow-400 hover:shadow-[0_0_15px_rgba(255,213,0,0.3)] hover:-translate-y-0.5 transition-all duration-200"
          >
            {submitting ? "Saving..." : "Save Address"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- UI HELPERS ---------------- */

function Field({
  label,
  children,
  colSpan,
}: {
  label: string;
  children: React.ReactNode;
  colSpan?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${
        colSpan ? "md:col-span-2" : ""
      }`}
    >
      <label className="text-sm font-medium text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value?: number;
  disabled?: boolean;
  options: { code: number; name: string }[];
  onChange: (v?: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-400">
        {label}
      </label>
      <select
        className={`border rounded-xl px-4 py-3 text-sm bg-[#1a1a1a] text-white focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer border-gray-800 focus:border-primary/50 focus:ring-primary/50 ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) =>
          onChange(
            e.target.value
              ? Number(e.target.value)
              : undefined
          )
        }
      >
        <option value="" disabled>
          Select {label}
        </option>
        {options.map((o) => (
          <option key={o.code} value={o.code} className="bg-[#1a1a1a] text-white">
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
