"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Modal, Spinner, Tabs } from "@bandhan/ui";
import { useGetSuggestedServicesQuery, useGetSuggestedVenuesQuery } from "@/store/api/eventApi";
import { Event, SuggestedService, SuggestedVenue } from "@/types/event";

interface Props {
  open: boolean;
  onClose: () => void;
  event: Event;
  onAddService: (service: SuggestedService) => void;
  onAddVenue: (venue: SuggestedVenue) => void;
}

export function AddVendorVenueModal({ open, onClose, event, onAddService, onAddVenue }: Props) {
  const [tab, setTab] = useState("services");

  const params = {
    eventType: event?.eventType,
    budget: event?.budget?.total || 0,
    guests: event?.guestCount || 0,
    location: event?.location,
  };

  const { data: svcData, isLoading: svcLoading } = useGetSuggestedServicesQuery(params, {
    skip: !open || !event?.id,
  });
  const { data: venData, isLoading: venLoading } = useGetSuggestedVenuesQuery(params, {
    skip: !open || !event?.id,
  });

  const services = svcData?.data ?? [];
  const venues = venData?.data ?? [];

  const handleAddService = (svc: SuggestedService) => {
    onAddService(svc);
    onClose();
  };
  const handleAddVenue = (ven: SuggestedVenue) => {
    onAddVenue(ven);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add vendor or venue"
      size="lg"
      closeable={true}
      footer={
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className="bhn-btn bhn-btn-secondary bhn-btn-sm">
            Close
          </button>
        </div>
      }
    >
      <Tabs
        items={[
          { id: "services", label: "Suggested services" },
          { id: "venues", label: "Suggested venues" },
        ]}
        active={tab}
        onChange={setTab}
        className="mb-4"
      />

      {tab === "services" && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {svcLoading ? (
            <div className="flex py-8 justify-center">
              <Spinner size="sm" />
            </div>
          ) : services.length === 0 ? (
            <p className="text-sm text-[var(--bhn-text-muted)]">No services suggested for this event yet.</p>
          ) : (
            services.map((svc: SuggestedService) => (
              <div key={svc._id || svc.id} className="flex items-center justify-between bhn-card p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-[var(--bhn-surface-3)] overflow-hidden">
                    {svc.image ? <img src={svc.image} alt={svc.title} className="h-full w-full object-cover" /> : <Search size={16} className="m-2 text-[var(--bhn-text-soft)]" />}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--bhn-text)]">{svc.title}</p>
                    <p className="text-xs text-[var(--bhn-text-muted)]">{svc.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[var(--bhn-text)]">₹{Number(svc.price || 0).toLocaleString()}</span>
                  <button type="button" onClick={() => handleAddService(svc)} className="bhn-btn bhn-btn-primary bhn-btn-sm">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "venues" && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {venLoading ? (
            <div className="flex py-8 justify-center">
              <Spinner size="sm" />
            </div>
          ) : venues.length === 0 ? (
            <p className="text-sm text-[var(--bhn-text-muted)]">No venues suggested for this event yet.</p>
          ) : (
            venues.map((ven: SuggestedVenue) => (
              <div key={ven._id || ven.id} className="flex items-center justify-between bhn-card p-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-[var(--bhn-surface-3)] overflow-hidden">
                    {ven.image || ven.images?.[0] ? (
                      <img src={ven.image || ven.images?.[0]} alt={ven.name} className="h-full w-full object-cover" />
                    ) : (
                      <Search size={16} className="m-2 text-[var(--bhn-text-soft)]" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--bhn-text)]">{ven.name}</p>
                    <p className="text-xs text-[var(--bhn-text-muted)]">{ven.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => handleAddVenue(ven)} className="bhn-btn bhn-btn-primary bhn-btn-sm">
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
