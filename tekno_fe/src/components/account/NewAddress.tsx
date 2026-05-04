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
    `border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
      error ? "border-red-500 focus:ring-red-300" : "focus:ring-primary/40"
    }`;

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Recipient name"
            required
            error={fieldErrors.recipientName}
          >
            <input
              className={inputClass(fieldErrors.recipientName)}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </Field>

          <Field label="Phone number" required error={fieldErrors.phoneNumber}>
            <input
              className={inputClass(fieldErrors.phoneNumber)}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </Field>

          <Select
            label="Province"
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
            label="Ward"
            required
            value={wardId}
            options={wards}
            disabled={!districtId || loading}
            error={fieldErrors.ward}
            onChange={setWardId}
          />

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
            />
            <span className="text-sm text-gray-700">
              Set as default address
            </span>
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
            />
          </Field>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm disabled:bg-gray-300"
          >
            {submitting ? "Saving..." : "Save address"}
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
    <div className={`flex flex-col gap-1 ${colSpan ? "md:col-span-2" : ""}`}>
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
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
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        className={`border rounded-lg px-3 py-2 text-sm ${
          error ? "border-red-500" : ""
        }`}
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) =>
          onChange(e.target.value ? Number(e.target.value) : undefined)
        }
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o) => (
          <option key={o.code} value={o.code}>
            {o.name}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
