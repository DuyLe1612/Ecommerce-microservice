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

  const inputClass =
    "border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Họ tên">
            <input
              className={inputClass}
              value={recipientName}
              onChange={(e) =>
                setRecipientName(e.target.value)
              }
            />
          </Field>

          <Field label="Số điện thoại">
            <input
              className={inputClass}
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(e.target.value)
              }
            />
          </Field>

          <Select
            label="Tỉnh"
            value={provinceCode}
            options={provinces}
            disabled={loading}
            onChange={setProvinceCode}
          />

          <Select
            label="Quận"
            value={districtCode}
            options={districts}
            disabled={!provinceCode || loading}
            onChange={setDistrictCode}
          />

          <Select
            label="Phường"
            value={wardCode}
            options={wards}
            disabled={!districtCode || loading}
            onChange={setWardCode}
          />

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) =>
                setIsDefault(e.target.checked)
              }
            />
            <span className="text-sm text-gray-700">
              Set as default address
            </span>
          </div>

          <Field label="Địa chỉ" colSpan>
            <input
              className={inputClass}
              value={addressLine}
              onChange={(e) =>
                setAddressLine(e.target.value)
              }
            />
          </Field>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:bg-gray-300"
          >
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
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
      className={`flex flex-col gap-1 ${
        colSpan ? "md:col-span-2" : ""
      }`}
    >
      <label className="text-sm font-medium text-gray-700">
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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        className="border rounded-lg px-3 py-2 text-sm"
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
        <option value="">
          Select {label.toLowerCase()}
        </option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </select>
    </div>
  );
}
