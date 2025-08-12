"use client"

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, Save } from "lucide-react";

export default function EditTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const [tournament, setTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    maxParticipants: 0,
    schedule: [],
    rules: [],
  });

  useEffect(() => {
    const fetchTournament = async () => {
      setLoading(true);
      const res = await fetch(`/api/tournaments/${params.id}`);
      if (!res.ok) return;
      const data = await res.json();
      setTournament(data.tournament);
      setParticipants(data.tournament.participants || []);
      setForm({
        name: data.tournament.name,
        description: data.tournament.description,
        maxParticipants: data.tournament.maxParticipants,
        schedule: data.tournament.schedule || [],
        rules: data.tournament.rules || [],
      });
      // Check if current user is the owner
      const user = JSON.parse(localStorage.getItem("user") || "null");
      setIsOwner(user && data.tournament.createdBy === user._id);
      setLoading(false);
    };
    fetchTournament();
  }, [params.id]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleScheduleChange = (idx: number, field: string, value: string) => {
    const updated = form.schedule.map((item: any, i: number) =>
      i === idx ? { ...item, [field]: value } : item
    );
    setForm({ ...form, schedule: updated });
  };

  const handleAddSchedule = () => {
    setForm({
      ...form,
      schedule: [
        ...form.schedule,
        { date: "", time: "", event: "", location: "" },
      ],
    });
  };

  const handleRemoveSchedule = (idx: number) => {
    setForm({
      ...form,
      schedule: form.schedule.filter((_: any, i: number) => i !== idx),
    });
  };

  const handleRuleChange = (idx: number, value: string) => {
    const updated = form.rules.map((item: string, i: number) =>
      i === idx ? value : item
    );
    setForm({ ...form, rules: updated });
  };

  const handleAddRule = () => {
    setForm({ ...form, rules: [...form.rules, ""] });
  };

  const handleRemoveRule = (idx: number) => {
    setForm({ ...form, rules: form.rules.filter((_: string, i: number) => i !== idx) });
  };

  const handleSave = async () => {
    await fetch(`/api/tournaments/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setEditMode(false);
    router.refresh();
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!isOwner) return <div className="p-8 text-red-600">You are not authorized to edit this tournament.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" /> Edit Tournament
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input name="name" value={form.name} onChange={handleChange} disabled={!editMode} className="mb-2" />
          <Textarea name="description" value={form.description} onChange={handleChange} disabled={!editMode} className="mb-2" />
          <Input name="maxParticipants" type="number" value={form.maxParticipants} onChange={handleChange} disabled={!editMode} className="mb-2" />

          {/* Schedule Edit */}
          <div className="mb-4">
            <div className="font-semibold mb-2">Schedule</div>
            {form.schedule.length === 0 && <div className="text-gray-500 text-sm mb-2">No schedule events yet.</div>}
            {form.schedule.map((item: any, idx: number) => (
              <div key={idx} className="flex flex-wrap gap-2 mb-2 items-center">
                <Input
                  type="date"
                  value={item.date}
                  onChange={e => handleScheduleChange(idx, "date", e.target.value)}
                  disabled={!editMode}
                  className="w-32"
                />
                <Input
                  type="text"
                  placeholder="Time"
                  value={item.time}
                  onChange={e => handleScheduleChange(idx, "time", e.target.value)}
                  disabled={!editMode}
                  className="w-28"
                />
                <Input
                  type="text"
                  placeholder="Event"
                  value={item.event}
                  onChange={e => handleScheduleChange(idx, "event", e.target.value)}
                  disabled={!editMode}
                  className="flex-1"
                />
                <Input
                  type="text"
                  placeholder="Location"
                  value={item.location}
                  onChange={e => handleScheduleChange(idx, "location", e.target.value)}
                  disabled={!editMode}
                  className="w-32"
                />
                {editMode && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSchedule(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                )}
              </div>
            ))}
            {editMode && (
              <Button variant="outline" size="sm" onClick={handleAddSchedule} className="mt-1"><Plus className="h-4 w-4 mr-1" />Add Event</Button>
            )}
          </div>

          {/* Rules Edit */}
          <div className="mb-4">
            <div className="font-semibold mb-2">Rules</div>
            {form.rules.length === 0 && <div className="text-gray-500 text-sm mb-2">No rules yet.</div>}
            {form.rules.map((rule: string, idx: number) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <Input
                  type="text"
                  value={rule}
                  onChange={e => handleRuleChange(idx, e.target.value)}
                  disabled={!editMode}
                  className="flex-1"
                />
                {editMode && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveRule(idx)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                )}
              </div>
            ))}
            {editMode && (
              <Button variant="outline" size="sm" onClick={handleAddRule} className="mt-1"><Plus className="h-4 w-4 mr-1" />Add Rule</Button>
            )}
          </div>

          <div className="flex gap-2">
            {editMode ? (
              <Button onClick={handleSave} className="bg-green-600 text-white"><Save className="h-4 w-4 mr-1" />Save</Button>
            ) : (
              <Button onClick={() => setEditMode(true)} className="bg-blue-600 text-white"><Edit className="h-4 w-4 mr-1" />Edit</Button>
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" /> Participants ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <div className="text-gray-500">No participants yet.</div>
          ) : (
            <div className="space-y-3">
              {participants.map((p, i) => (
                <div key={i} className="flex items-center gap-4 border-b pb-2">
                  <Badge className="mr-2">{i + 1}</Badge>
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-600">{p.email} {p.phone && `| ${p.phone}`}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Owner Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <Button className="bg-black text-white w-full" onClick={async () => {
            await fetch(`/api/tournaments/${params.id}/register`, { method: "POST" });
            router.refresh();
          }}>
            Participate as Owner
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
