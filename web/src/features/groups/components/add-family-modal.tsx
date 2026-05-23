"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { MockParticipant } from "@/src/features/groups/mock-group-store";

type AddFamilyModalProps = {
  isOpen: boolean;
  participants: MockParticipant[];
  onClose: () => void;
  onSave: (familyName: string, participantEmails: string[]) => void;
};

export default function AddFamilyModal({
  isOpen,
  participants,
  onClose,
  onSave,
}: AddFamilyModalProps) {
  const [familyName, setFamilyName] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const unassignedParticipants = participants.filter(
    (participant) => participant.family === "None",
  );

  function resetForm() {
    setFamilyName("");
    setSelectedEmails([]);
  }

  function closeModal() {
    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  function toggleParticipant(email: string) {
    setSelectedEmails((currentEmails) =>
      currentEmails.includes(email)
        ? currentEmails.filter((currentEmail) => currentEmail !== email)
        : [...currentEmails, email],
    );
  }

  function handleSave() {
    const trimmedName = familyName.trim();
    if (!trimmedName) return;

    onSave(trimmedName, selectedEmails);
    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-border bg-neutral shadow-xl">
        <div className="flex items-center justify-between border-b border-border px-7 py-6">
          <h2 className="font-heading text-3xl font-extrabold text-primary">
            Add Family
          </h2>
          <button
            aria-label="Close add family modal"
            className="cursor-pointer text-text-muted hover:text-primary"
            onClick={closeModal}
          >
            <X size={26} />
          </button>
        </div>

        <div className="px-7 py-7">
          <label className="block">
            <span className="text-sm font-extrabold uppercase tracking-widest text-text-muted">
              Family Name
            </span>
            <input
              className="mt-3 h-14 w-full rounded-md bg-border px-5 text-lg text-text outline-none placeholder:text-text-muted/40 focus:ring-2 focus:ring-primary"
              onChange={(event) => setFamilyName(event.target.value)}
              placeholder="e.g. The Miller Family"
              value={familyName}
            />
          </label>

          <div className="mt-9 flex items-center justify-between gap-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-text-muted">
              Add Unassigned Participants
            </h3>
            <span className="rounded-sm bg-tertiary px-3 py-1 text-xs font-bold text-text">
              Optional
            </span>
          </div>

          <ul className="mt-6 space-y-3">
            {unassignedParticipants.map((participant) => {
              const isSelected = selectedEmails.includes(participant.email);

              return (
                <li
                  key={participant.email}
                  className={
                    isSelected
                      ? "flex items-center justify-between rounded bg-surface px-4 py-3"
                      : "flex items-center justify-between rounded px-4 py-3"
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex size-12 items-center justify-center rounded-xl text-lg font-extrabold ${participant.color}`}
                    >
                      {participant.initials}
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-text">
                        {participant.name}
                      </p>
                      <p className="text-sm text-text-muted">
                        {participant.email}
                      </p>
                    </div>
                  </div>

                  <button
                    aria-label={`Select ${participant.name}`}
                    className={
                      isSelected
                        ? "flex size-6 cursor-pointer items-center justify-center rounded-sm bg-primary text-background"
                        : "size-6 cursor-pointer rounded-sm border border-text-muted"
                    }
                    onClick={() => toggleParticipant(participant.email)}
                  >
                    {isSelected ? <Check size={17} /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center justify-end gap-8 bg-surface px-7 py-6">
          <button
            className="cursor-pointer text-lg font-extrabold text-text hover:text-primary"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="h-12 cursor-pointer rounded bg-primary px-10 text-lg font-extrabold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!familyName.trim()}
            onClick={handleSave}
          >
            Save Family
          </button>
        </div>
      </div>
    </div>
  );
}
