"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createProfileAddress, AddressPayload } from "@/services/profile";
import { getProvinces, getDistricts, getWards } from "@/services/location";
import { District, Province, Ward } from "@/type/location";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */

type Props = {
  onCreated?: () => void;
  onClose?: () => void;
  initialRecipientName?: string;
  initialPhoneNumber?: string;
};

type FieldErrors = Partial<
  Record<
    | "recipientName"
    | "phoneNumber"
    | "addressLine"
    | "province"
    | "district"
    | "ward",
    string
  >
>;

const backendFieldMap: Record<string, keyof FieldErrors> = {
  RecipientName: "recipientName",
  PhoneNumber: "phoneNumber",
  AddressLine: "addressLine",
  ProvinceCode: "province",
  DistrictCode: "district",
  WardCode: "ward",
};

/* ---------------- COMPONENT ---------------- */

export default function NewAddress({ onCreated, onClose, initialRecipientName = "", initialPhoneNumber = "" }: Props) {
  const [recipientName, setRecipientName] = useState(initialRecipientName);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [addressLine, setAddressLine] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [wardId, setWardId] = useState<number | undefined>();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        setProvinces(await getProvinces());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setDistrictId(undefined);
      setWards([]);
      setWardId(undefined);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        setDistricts(await getDistricts(provinceId));
      } finally {
        setLoading(false);
      }
    })();
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      setWardId(undefined);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        setWards(await getWards(districtId));
      } finally {
        setLoading(false);
      }
    })();
  }, [districtId]);

  /* ---------------- SUBMIT ---------------- */

  const canSubmit = useMemo(
    () =>
      recipientName.trim() &&
      phoneNumber.trim() &&
      addressLine.trim() &&
      provinceId &&
      districtId &&
      wardId,
    [recipientName, phoneNumber, addressLine, provinceId, districtId, wardId]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setFieldErrors({});

    try {
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing auth token");

      const selectedProvince = provinces.find((p) => p.code === provinceId);
      const selectedDistrict = districts.find((d) => d.code === districtId);
      const selectedWard = wards.find((w) => w.code === wardId);

      if (!selectedProvince || !selectedDistrict || !selectedWard) {
        throw new Error("Invalid location selection");
      }

      const payload = {
        recipientName: recipientName.trim(),
        phoneNumber: phoneNumber.trim(),
        addressLine: addressLine.trim(),

        provinceCode: selectedProvince.code,
        provinceName: selectedProvince.name,

        districtCode: selectedDistrict.code,
        districtName: selectedDistrict.name,

        wardCode: selectedWard.code,
        wardName: selectedWard.name,

        isDefault,
      };

      await createProfileAddress(token, payload);

      toast.success("Address created successfully");

      onCreated?.();
      onClose?.();
    } catch (err: any) {
      if (err?.errors) {
        const mapped: FieldErrors = {};
        Object.keys(err.errors).forEach((k) => {
          const uiKey = backendFieldMap[k];
          if (uiKey) mapped[uiKey] = err.errors[k][0];
        });
        setFieldErrors(mapped);
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */

  const inputClass = (error?: string) =>
    `border rounded-xl px-4 py-3 text-sm bg-[#1a1a1a] text-white focus:outline-none focus:ring-1 transition-all ${
      error ? "border-red-500 focus:ring-red-500/50" : "border-gray-800 focus:border-primary/50 focus:ring-primary/50"
    }`;

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6 bg-[#111111]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field
            label="Recipient Name"
            required
            error={fieldErrors.recipientName}
          >
            <input
              className={inputClass(fieldErrors.recipientName)}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="E.g., John Doe"
            />
          </Field>

          <Field label="Phone Number" required error={fieldErrors.phoneNumber}>
            <input
              className={inputClass(fieldErrors.phoneNumber)}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="E.g., +84 123 456 789"
            />
          </Field>

          <Select
            label="Province / City"
            required
            value={provinceId}
            options={provinces}
            disabled={loading}
            error={fieldErrors.province}
            onChange={setProvinceId}
          />

          <Select
            label="District"
            required
            value={districtId}
            options={districts}
            disabled={!provinceId || loading}
            error={fieldErrors.district}
            onChange={setDistrictId}
          />

          <Select
            label="Ward / Commune"
            required
            value={wardId}
            options={wards}
            disabled={!districtId || loading}
            error={fieldErrors.ward}
            onChange={setWardId}
          />

          <div className="flex items-center gap-3 md:col-span-2 mt-2">
            <input
              type="checkbox"
              id="isDefaultNew"
              className="w-4 h-4 rounded border-gray-600 bg-[#1a1a1a] text-primary focus:ring-primary focus:ring-offset-[#111111] cursor-pointer"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <label htmlFor="isDefaultNew" className="text-sm text-gray-300 cursor-pointer select-none">
              Set as default address
            </label>
          </div>

          <Field
            label="Detail Address"
            required
            error={fieldErrors.addressLine}
            colSpan
          >
            <input
              className={inputClass(fieldErrors.addressLine)}
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
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

/* ---------------- HELPERS ---------------- */

function Field({
  label,
  required,
  error,
  colSpan,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  colSpan?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-2 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="text-sm font-medium text-gray-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
  error,
  required,
}: {
  label: string;
  value?: number;
  disabled?: boolean;
  options: { code: number; name: string }[];
  onChange: (v?: number) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-400">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`border rounded-xl px-4 py-3 text-sm bg-[#1a1a1a] text-white focus:outline-none focus:ring-1 transition-all appearance-none cursor-pointer ${
          error ? "border-red-500 focus:ring-red-500/50" : "border-gray-800 focus:border-primary/50 focus:ring-primary/50"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
      >
        <option value="" disabled>Select {label}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code} className="bg-[#1a1a1a] text-white">
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
