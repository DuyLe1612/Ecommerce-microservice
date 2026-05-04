"use client";
import React, { useEffect, useState } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import {
  CirclePlus,
  MailIcon,
  Phone,
  Plug,
  SquarePen,
  UserRound,
  X,
  Loader2,
  MapPinHouse
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TitleAccount from "@/components/account/TitleAccount";
import { getProfile, getProfileAddresses, Profile } from "@/services/profile";
import { updateProfileAll, deleteProfileAddress } from "@/services/profile";
import { ProfileAddress } from "@/type/address";
import { Button } from "@/components/ui/button";
import EditAddress from "@/components/account/EditAddress";
import NewAddress from "@/components/account/NewAddress";
import { toast } from "sonner";

export default function Page() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<ProfileAddress | null>(null);
  const [addresses, setAddresses] = useState<ProfileAddress[]>([]);

  // Local state để edit
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Password modal state
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAddress = async (addressId: number) => {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token") || "";
      if (!token) throw new Error("Missing token");

      await deleteProfileAddress(token, addressId);

      const updatedAddresses = addresses.filter(
        (addr) => addr.id !== addressId
      );
      setAddresses(updatedAddresses);

      toast.success("Đã xóa địa chỉ thành công");
    } catch (e: any) {
      toast.error(e?.message || "Xóa địa chỉ thất bại");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddressCreated = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const list = await getProfileAddresses(token);
      setAddresses(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Fetch addresses error:", e);
    }
  };

  const handleAddressUpdated = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const list = await getProfileAddresses(token);
      setAddresses(Array.isArray(list) ? list : []);

      setOpenEditDialog(false);
      setSelectedAddress(null);
      toast.success("Address updated successfully");
    } catch (e) {
      console.error("Fetch addresses error:", e);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    getProfile(token)
      .then((res) => {
        setProfile(res);
        setFullname(res.fullName || "");
        setEmail(res.email || "");
        setPhoneNumber(res.phoneNumber || "");
      })
      .catch((err) => {
        console.error("Fetch profile error:", err);
        toast.error("Không thể tải thông tin hồ sơ");
      })
      .finally(() => {
        setLoading(false);
      });

    (async () => {
      try {
        const list = await getProfileAddresses(token);
        setAddresses(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Fetch addresses error:", e);
        setAddresses([]);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500 animate-pulse">Loading...</p>
      </div>
    );
  }

  const handleSave = async () => {
    setOpenPasswordModal(true);
  };

  const handleCancelEdit = () => {
    setFullname(profile?.fullName || "");
    setEmail(profile?.email || "");
    setPhoneNumber(profile?.phoneNumber || "");
    setEditing(false);
  };

  const confirmSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    if (!currentPassword.trim()) {
      toast.error("Please enter your current password to confirm changes");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        fullname,
        newEmail: email,
        phoneNumber,
        currentPassword,
      };

      await updateProfileAll(token, payload);

      setProfile({ ...profile, fullName: fullname, email: email, phoneNumber: phoneNumber });

      setEditing(false);
      setOpenPasswordModal(false);
      setCurrentPassword("");
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <TitleAccount title="Personal Data" des="Manage your identity information" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 border rounded-lg bg-gray-50/50">
        {/* Full Name */}
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="name" className={editing ? "text-primary font-medium" : "text-gray-600"}>Full Name</Label>
          <InputGroup>
            <InputGroupInput
              disabled={!editing}
              type="text"
              id="name"
              placeholder="Enter your full name..."
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className={editing ? "bg-white focus:ring-primary" : "bg-gray-100/50"}
            />
            <InputGroupAddon>
              <UserRound className="w-4 h-4 text-gray-500" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Email */}
        <div className="grid w-full items-center gap-2">
          <Label htmlFor="email" className={editing ? "text-primary font-medium" : "text-gray-600"}>Email Address</Label>
          <InputGroup>
            <InputGroupInput
              disabled={!editing}
              type="email"
              id="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={editing ? "bg-white focus:ring-primary" : "bg-gray-100/50"}
            />
            <InputGroupAddon>
              <MailIcon className="w-4 h-4 text-gray-500" />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Phone */}
        <div className="grid w-full items-center gap-2 md:col-span-2 lg:col-span-1">
          <Label htmlFor="phone" className={editing ? "text-primary font-medium" : "text-gray-600"}>Phone Number</Label>
          <InputGroup>
            <InputGroupInput
              disabled={!editing}
              type="tel"
              id="phone"
              placeholder="Enter your phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={editing ? "bg-white focus:ring-primary" : "bg-gray-100/50"}
            />
            <InputGroupAddon>
              <Phone className="w-4 h-4 text-gray-500" />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        {editing ? (
          <div className="flex w-full sm:w-auto gap-3">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="flex-1 sm:flex-none px-6"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-8 bg-primary hover:bg-primary/90"
            >
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="w-full sm:w-auto px-8"
          >
            <SquarePen className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Modal xác thực Password */}
      <Dialog open={openPasswordModal} onOpenChange={setOpenPasswordModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              For security reasons, please enter your current password to save these changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid w-full items-center gap-3 py-4">
            <Label htmlFor="currentPassword">Your Password</Label>
            <InputGroup>
              <InputGroupInput
                id="currentPassword"
                type="password"
                placeholder="Enter your password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && currentPassword.trim() && confirmSave()}
              />
              <InputGroupAddon>
                <Plug className="w-4 h-4 text-gray-500" />
              </InputGroupAddon>
            </InputGroup>
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setOpenPasswordModal(false);
                setCurrentPassword("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmSave}
              disabled={saving || !currentPassword.trim()}
              className="bg-primary hover:bg-primary/90 min-w-[100px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-6 border-t pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div>
            <h3 className="text-lg font-semibold">Shipping Addresses</h3>
            <p className="text-sm text-gray-500">Manage your shipping addresses</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <CirclePlus className="w-4 h-4" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Shipping Address</DialogTitle>
                <DialogDescription>
                  <NewAddress
                    onClose={() => setOpen(false)}
                    onCreated={handleAddressCreated}
                    initialRecipientName={profile?.fullName}
                    initialPhoneNumber={profile?.phoneNumber}
                  />
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg bg-gray-50">
            <MapPinHouse className="w-8 h-8 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              You haven't saved any addresses yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border rounded-lg p-4 flex flex-col gap-2 bg-white hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">
                      {addr.recipientName}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-gray-600">{addr.phoneNumber}</span>
                    {addr.isDefault && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium ml-2">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Dialog Chỉnh sửa địa chỉ */}
                    <Dialog
                      open={openEditDialog && selectedAddress?.id === addr.id}
                      onOpenChange={(isOpen) => {
                        setOpenEditDialog(isOpen);
                        if (!isOpen) setSelectedAddress(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => setSelectedAddress(addr)}
                        >
                          Edit
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Edit Address</DialogTitle>
                          <DialogDescription>
                            Update your shipping information below.
                          </DialogDescription>
                        </DialogHeader>
                        {/* Component Form chỉnh sửa */}
                        <EditAddress
                          address={addr}
                          onUpdated={handleAddressUpdated}
                          onClose={() => {
                            setOpenEditDialog(false);
                            setSelectedAddress(null);
                          }}
                        />
                      </DialogContent>
                    </Dialog>

                    {/* Dialog xác nhận xóa địa chỉ */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Delete Address</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the address "
                            {addr.addressLine}, {addr.wardName}, {addr.districtName},{" "}
                            {addr.provinceName}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAddress(addr.id)}
                            disabled={deleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {deleting ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            {deleting ? "Deleting..." : "Delete"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                {/* Thông tin chi tiết địa chỉ */}
                <div className="text-sm text-gray-700 mt-1">
                  {addr.addressLine}
                </div>
                <div className="text-sm text-gray-500">
                  {addr.wardName}, {addr.districtName}, {addr.provinceName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}