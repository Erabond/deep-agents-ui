"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Settings {
  name: string;
  meeting_link: string;
  voice: string;
  reply_template: string;
  outreach_template: string;
}

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    name: "",
    meeting_link: "",
    voice: "",
    reply_template: "",
    outreach_template: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      try {
        const token = await user.getIdToken();
        const r = await fetch(`/api/clients/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await r.json();
        setSettings({
          name: data.name ?? "",
          meeting_link: data.meeting_link ?? "",
          voice: data.voice ?? "",
          reply_template: data.reply_template ?? "",
          outreach_template: data.outreach_template ?? "",
        });
      } catch {}
    })();
  }, [open, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const token = await user.getIdToken();
      await fetch(`/api/clients/${user.uid}/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              placeholder="e.g. Sarah"
              value={settings.name}
              onChange={(e) => setSettings({ ...settings, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="meeting_link">Meeting link</Label>
            <Input
              id="meeting_link"
              placeholder="https://cal.com/yourname"
              value={settings.meeting_link}
              onChange={(e) => setSettings({ ...settings, meeting_link: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="voice">Voice & style</Label>
            <p className="text-xs text-muted-foreground">
              Describe how you write emails — tone, length, anything you want the agent to match.
            </p>
            <Textarea
              id="voice"
              placeholder="e.g. Casual and direct. Short sentences. Never use buzzwords."
              value={settings.voice}
              onChange={(e) => setSettings({ ...settings, voice: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reply_template">Reply template</Label>
            <p className="text-xs text-muted-foreground">
              A template the agent uses when replying to inbound emails. Leave blank to let the agent decide.
            </p>
            <Textarea
              id="reply_template"
              placeholder={"Hey [first name],\n\nThanks for reaching out. [response]\n\nHere's my availability: [meeting_link]\n\nThanks,\n[name]"}
              value={settings.reply_template}
              onChange={(e) => setSettings({ ...settings, reply_template: e.target.value })}
              rows={6}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="outreach_template">Outreach template</Label>
            <p className="text-xs text-muted-foreground">
              A template for outbound outreach emails. Leave blank to let the agent decide.
            </p>
            <Textarea
              id="outreach_template"
              placeholder={"Hey [first name],\n\n[personalised opener]. [value prop].\n\nHere's my availability: [meeting_link]\n\nThanks,\n[name]"}
              value={settings.outreach_template}
              onChange={(e) => setSettings({ ...settings, outreach_template: e.target.value })}
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saved ? "Saved" : saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
