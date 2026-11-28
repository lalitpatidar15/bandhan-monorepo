"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  Button,
  Card,
  CardBody,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  Textarea,
} from "@bandhan/ui";
import Sidebar from "@/components/Sidebar";
import { getApiErrorMessage, normalizeList } from "@/lib/response";
import {
  useCreateVendorPackageMutation,
  useDeleteVendorPackageMutation,
  useGetVendorPackagesQuery,
  useUpdateVendorPackageMutation,
  type ServicePackage,
} from "@/lib/store/api/vendorApi";

type PackageForm = {
  name: string;
  serviceId: string;
  description: string;
  price: string;
  billingCycle: "one_time" | "monthly" | "seasonal";
  inclusions: string;
  isActive: boolean;
};

const emptyForm: PackageForm = {
  name: "",
  serviceId: "",
  description: "",
  price: "",
  billingCycle: "one_time",
  inclusions: "",
  isActive: true,
};

const formatCurrency = (value?: number) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function VendorPackagesPage() {
  const { data, isLoading, isError, refetch } = useGetVendorPackagesQuery();
  const [createPackage, { isLoading: isCreating }] = useCreateVendorPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdateVendorPackageMutation();
  const [deletePackage, { isLoading: isDeleting }] = useDeleteVendorPackageMutation();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ServicePackage | null>(null);

  const packages = normalizeList<ServicePackage>(data);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: ServicePackage) => {
    setEditingId(item._id);
    setForm({
      name: item.name || "",
      serviceId: typeof item.serviceId === "object" ? item.serviceId?._id || "" : item.serviceId || "",
      description: item.description || "",
      price: String(item.price ?? ""),
      billingCycle: item.billingCycle || "one_time",
      inclusions: Array.isArray(item.inclusions) ? item.inclusions.join(", ") : "",
      isActive: item.isActive !== false,
    });
    setShowForm(true);
  };

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("Package name is required");
      return;
    }
    const body = {
      name: form.name.trim(),
      serviceId: form.serviceId || undefined,
      description: form.description.trim() || undefined,
      price: Number(form.price) || 0,
      billingCycle: form.billingCycle,
      inclusions: form.inclusions.split(",").map((value) => value.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await updatePackage({ id: editingId, body }).unwrap();
        toast.success("Package updated");
      } else {
        await createPackage(body).unwrap();
        toast.success("Package created");
      }
      setShowForm(false);
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the package"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePackage(deleteTarget._id).unwrap();
      toast.success("Package deleted");
      setDeleteTarget(null);
      refetch();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete the package"));
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bhn-bg)]">
      <Sidebar />
      <div className="flex-1 overflow-hidden px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-6xl">
        <PageHeader
          title="Service packages"
          subtitle="Bundle your services into priced packages buyers can discover."
          actions={<Button icon={<Plus size={16} />} onClick={openCreate} disabled={isCreating || isUpdating || isDeleting}>New package</Button>}
        />

        {isLoading ? (
          <div className="mt-10 flex justify-center"><Spinner /></div>
        ) : isError ? (
          <div className="mt-10">
            <EmptyState
              title="Could not load packages"
              description="Please try again in a moment."
              action={<Button variant="secondary" onClick={() => refetch()}>Retry</Button>}
            />
          </div>
        ) : packages.length === 0 ? (
          <div className="mt-10">
            <EmptyState
              icon={<Plus size={24} />}
              title="No packages yet"
              description="Create a package to group related services with clear pricing and inclusions."
              action={<Button onClick={openCreate}>Create your first package</Button>}
            />
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {packages.map((item) => (
              <Card key={item._id} padded={false}>
                <CardBody>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[var(--bhn-text)]">{item.name}</h3>
                      <p className="mt-0.5 text-xs capitalize text-[var(--bhn-text-muted)]">
                        {(item.billingCycle || "one_time").replace("_", " ")}
                      </p>
                    </div>
                    <span className={`bhn-badge ${item.isActive === false ? "neutral" : "success"}`}>
                      {item.isActive === false ? "Inactive" : "Active"}
                    </span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-[var(--bhn-text)]">{formatCurrency(item.price)}</p>
                  {item.description ? (
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--bhn-text-muted)]">{item.description}</p>
                  ) : null}
                  {Array.isArray(item.inclusions) && item.inclusions.length > 0 ? (
                    <ul className="mt-3 space-y-1 text-xs text-[var(--bhn-text-muted)]">
                      {item.inclusions.slice(0, 4).map((inclusion) => <li key={inclusion}>• {inclusion}</li>)}
                    </ul>
                  ) : null}
                  <div className="mt-4 flex gap-2 border-t border-[var(--bhn-border)] pt-3">
                    <Button size="sm" variant="secondary" icon={<Pencil size={14} />} onClick={() => openEdit(item)} disabled={isCreating || isUpdating}>Edit</Button>
                    <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => setDeleteTarget(item)} disabled={isDeleting}>Delete</Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? "Edit package" : "New package"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={submit} loading={isCreating || isUpdating}>{editingId ? "Save changes" : "Create package"}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Package name" required className="md:col-span-2">
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Wedding decor essentials" />
          </Field>
          <Field label="Linked service ID" hint="Optional service this package belongs to">
            <Input value={form.serviceId} onChange={(event) => setForm({ ...form, serviceId: event.target.value })} placeholder="Service ID" />
          </Field>
          <Field label="Price (₹)">
            <Input type="number" min={0} value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
          </Field>
          <Field label="Billing cycle">
            <Select value={form.billingCycle} onChange={(event) => setForm({ ...form, billingCycle: event.target.value as PackageForm["billingCycle"] })}>
              <option value="one_time">One time</option>
              <option value="monthly">Monthly</option>
              <option value="seasonal">Seasonal</option>
            </Select>
          </Field>
          <Field label="Active">
            <Select value={form.isActive ? "yes" : "no"} onChange={(event) => setForm({ ...form, isActive: event.target.value === "yes" })}>
              <option value="yes">Active</option>
              <option value="no">Inactive</option>
            </Select>
          </Field>
          <Field label="Inclusions" hint="Comma separated" className="md:col-span-2">
            <Textarea rows={2} value={form.inclusions} onChange={(event) => setForm({ ...form, inclusions: event.target.value })} placeholder="Venue walkthrough, 3 design revisions" />
          </Field>
          <Field label="Description" className="md:col-span-2">
            <Textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="What is included in this package?" />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete package"
        message={`Delete “${deleteTarget?.name || ""}”? This cannot be undone.`}
        tone="danger"
        confirmLabel="Delete"
        loading={isDeleting}
      />
      </div>
    </div>
  );
}
