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
  MapPinHouse,
  Trash2,
  Pencil
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

      toast.success("Address deleted successfully");
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete address");
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
      console.warn("Fetch addresses error:", e);
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
      console.warn("Fetch addresses error:", e);
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
        console.warn("Fetch profile error:", err);
        toast.error("Failed to load profile information");
      })
      .finally(() => {
        setLoading(false);
      });

    (async () => {
      try {
        const list = await getProfileAddresses(token);
        setAddresses(Array.isArray(list) ? list : []);
      } catch (e) {
        console.warn("Fetch addresses error:", e);
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
      console.warn("Update failed:", err);
      toast.error(err.message || "An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <TitleAccount title="Personal Data" des="Manage your identity information" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-8 border border-gray-800 rounded-3xl bg-[#111111] shadow-[0_10px_40px_rgba(0,0,0,0.5)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none rounded-full group-hover:bg-primary/10 transition-colors"></div>
        {/* Full Name */}
        <div className="grid w-full items-center gap-2 relative z-10">
          <Label htmlFor="name" className={editing ? "text-primary font-bold" : "text-gray-400"}>Full Name</Label>
          <InputGroup className="border-gray-800 bg-[#1a1a1a]">
            <InputGroupInput
              disabled={!editing}
              type="text"
              id="name"
              placeholder="Enter your full name..."
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className={editing ? "bg-[#1a1a1a] focus:ring-1 focus:ring-primary focus:border-primary text-white shadow-inner" : "bg-transparent text-gray-500 opacity-80"}
            />
            <InputGroupAddon className="bg-transparent border-gray-800">
              <UserRound className={`w-4 h-4 ${editing ? "text-primary" : "text-gray-600"}`} />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Email */}
        <div className="grid w-full items-center gap-2 relative z-10">
          <Label htmlFor="email" className={editing ? "text-primary font-bold" : "text-gray-400"}>Email Address</Label>
          <InputGroup className="border-gray-800 bg-[#1a1a1a]">
            <InputGroupInput
              disabled={!editing}
              type="email"
              id="email"
              placeholder="Enter your email..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={editing ? "bg-[#1a1a1a] focus:ring-1 focus:ring-primary focus:border-primary text-white shadow-inner" : "bg-transparent text-gray-500 opacity-80"}
            />
            <InputGroupAddon className="bg-transparent border-gray-800">
              <MailIcon className={`w-4 h-4 ${editing ? "text-primary" : "text-gray-600"}`} />
            </InputGroupAddon>
          </InputGroup>
        </div>

        {/* Phone */}
        <div className="grid w-full items-center gap-2 md:col-span-2 lg:col-span-1 relative z-10">
          <Label htmlFor="phone" className={editing ? "text-primary font-bold" : "text-gray-400"}>Phone Number</Label>
          <InputGroup className="border-gray-800 bg-[#1a1a1a]">
            <InputGroupInput
              disabled={!editing}
              type="tel"
              id="phone"
              placeholder="Enter your phone number..."
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={editing ? "bg-[#1a1a1a] focus:ring-1 focus:ring-primary focus:border-primary text-white shadow-inner" : "bg-transparent text-gray-500 opacity-80"}
            />
            <InputGroupAddon className="bg-transparent border-gray-800">
              <Phone className={`w-4 h-4 ${editing ? "text-primary" : "text-gray-600"}`} />
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>

      <div className="flex justify-end mt-4 relative z-10">
        {editing ? (
          <div className="flex w-full sm:w-auto gap-3">
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              className="flex-1 sm:flex-none px-6 border-gray-800 text-gray-300 hover:text-white hover:bg-[#1a1a1a] rounded-xl"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-none px-8 bg-primary text-black font-bold hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] transition-all rounded-xl"
            >
              Save
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setEditing(true)}
            className="w-full sm:w-auto px-8 rounded-xl border-gray-800 bg-[#111111] text-gray-300 hover:text-primary hover:border-primary hover:bg-[#1a1a1a] shadow-sm hover:shadow-[0_0_15px_rgba(255,213,0,0.1)] transition-all duration-300"
          >
            <SquarePen className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Modal xác thực Password */}
      <Dialog open={openPasswordModal} onOpenChange={setOpenPasswordModal}>
        <DialogContent className="sm:max-w-[400px] bg-[#111111] border border-gray-800 text-white rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Changes</DialogTitle>
            <DialogDescription className="text-gray-400">
              For security reasons, please enter your current password to save these changes.
            </DialogDescription>
          </DialogHeader>

          <div className="grid w-full items-center gap-3 py-4">
            <Label htmlFor="currentPassword" className="text-gray-300">Your Password</Label>
            <InputGroup className="border-gray-800 bg-[#1a1a1a]">
              <InputGroupInput
                id="currentPassword"
                type="password"
                placeholder="Enter your password..."
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && currentPassword.trim() && confirmSave()}
                className="bg-[#1a1a1a] focus:ring-1 focus:ring-primary focus:border-primary text-white shadow-inner"
              />
              <InputGroupAddon className="bg-transparent border-gray-800">
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
              className="border-gray-800 text-gray-300 hover:text-white hover:bg-[#1a1a1a] rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmSave}
              disabled={saving || !currentPassword.trim()}
              className="bg-primary text-black font-bold hover:bg-primary/90 rounded-xl min-w-[100px]"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-8 border-t border-gray-800 pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">Shipping Addresses</h3>
            <p className="text-sm text-gray-400 mt-1">Manage your shipping addresses</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 rounded-xl px-6 bg-primary text-black font-bold hover:bg-primary/90 shadow-sm hover:shadow-[0_0_15px_rgba(255,213,0,0.2)] hover:-translate-y-0.5 transition-all active:scale-[0.98]">
                <CirclePlus className="w-4 h-4" />
                Add New Address
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#111111] border border-gray-800 text-white rounded-2xl">
              <DialogHeader>
                <DialogTitle>Add Shipping Address</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Fill in the details below to add a new shipping address.
                </DialogDescription>
              </DialogHeader>
              <NewAddress
                onClose={() => setOpen(false)}
                onCreated={handleAddressCreated}
                initialRecipientName={profile?.fullName}
                initialPhoneNumber={profile?.phoneNumber}
              />
            </DialogContent>
          </Dialog>
        </div>

        {addresses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 border border-dashed border-gray-800 rounded-3xl bg-[#111111] shadow-inner">
            <div className="w-16 h-16 rounded-full bg-[#1a1a1a] flex items-center justify-center mb-4 border border-gray-800">
              <MapPinHouse className="w-8 h-8 text-gray-500" />
            </div>
            <p className="text-base text-gray-400 text-center">
              You haven't saved any addresses yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="border border-gray-800 rounded-2xl p-6 flex flex-col gap-3 bg-[#111111] shadow-[0_5px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_5px_25px_rgba(255,213,0,0.05)] hover:border-primary/30 transition-all duration-300 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white tracking-wide">
                      {addr.recipientName}
                    </span>
                    <span className="text-gray-600">|</span>
                    <span className="text-gray-400">{addr.phoneNumber}</span>
                    {addr.isDefault && (
                      <span className="text-xs px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold ml-2 shadow-[0_0_10px_rgba(255,213,0,0.1)]">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
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
                          size="icon"
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg w-8 h-8"
                          onClick={() => setSelectedAddress(addr)}
                          title="Edit Address"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px] bg-[#111111] border border-gray-800 text-white rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>Edit Address</DialogTitle>
                          <DialogDescription className="text-gray-400">
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
                          size="icon"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg w-8 h-8"
                          title="Delete Address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#111111] border border-gray-800 text-white rounded-2xl shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-xl font-bold">Confirm Delete Address</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete the address "
                            <span className="text-white font-medium">{addr.addressLine}, {addr.wardName}, {addr.districtName},{" "}
                            {addr.provinceName}</span>"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={deleting} className="border-gray-800 text-gray-300 hover:text-white hover:bg-[#1a1a1a] rounded-xl">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteAddress(addr.id)}
                            disabled={deleting}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 rounded-xl"
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
                <div className="text-sm text-gray-400 mt-3 leading-relaxed bg-[#1a1a1a] p-4 rounded-xl border border-gray-800/50">
                  <p className="font-medium text-gray-300">{addr.addressLine}</p>
                  <p className="mt-1">
                    {addr.wardName}, {addr.districtName}, {addr.provinceName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}