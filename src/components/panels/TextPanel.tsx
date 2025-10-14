import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
export interface Person {
candidateId: number;
  candidateName: string;
}

interface TextPanelProps {
  candidate: Person;
  onSendSMS?: (data: {
    to: string[];
    message: string;
    template: string;
  }) => void;
}

export function TextPanel({ candidate, onSendSMS }: TextPanelProps) {
  const [recipients, setRecipients] = useState<string[]>([candidate.candidateName]);
  const [message, setMessage] = useState<string>("");
  const [template, setTemplate] = useState<string>("");
   const [saving, setSaving] = useState(false);

  const removeRecipient = (name: string) => {
    setRecipients((prev) => prev.filter((n) => n !== name));
  };

  const handleSend = async() => {

       if (!message.trim()) {
      toast.error("Please enter email subject line.");
      return;

    }
    setSaving(true);
    try {
      const payload = {
        candidate_id: candidate.candidateId,
        TextMessage: message,
        author_id: 1
      };
      const res = await axios.post(
        ` http://13.62.22.94:3000/candidate/sendCandidateText`,
        payload
      );
      if (res.data.status) {
        toast.success(res.data.message || "Sms Send successfully.");
         //refreshTrigger?.();
      } else {
        toast.error(res.data.message || "Failed to send sms.");
      }
    } catch (err: any) {
      console.error("Error sending sms", err);
      toast.error(
        err.response?.data?.message || err.message || "Server error."
      );
    } finally {
      setSaving(false);
    }
    onSendSMS?.({ to: recipients, message, template });
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center space-x-2">
        <span className="font-medium">To</span>
        <div className="flex-1 flex flex-wrap items-center gap-2 bg-gray-50 p-2 rounded">
          {recipients.map((name) => (
            <span
              key={name}
              className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-sm"
            >
              {name}
              {/* <span
                className="ml-1 cursor-pointer"
                onClick={() => removeRecipient(name)}
              >
                ×
              </span> */}
            </span>
          ))}
          {/* <button
            className="text-sm text-gray-400"
            onClick={() => setRecipients((prev) => [...prev, "New Recipient"])}
          >
            + add more
          </button> */}
        </div>
      </div>

      <div className="relative">
        <Textarea
          placeholder="Enter your message..."
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="absolute bottom-2 right-4 text-xs text-gray-500">
          {message.length}/160
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Select value={template} onValueChange={setTemplate}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tmpl1">SMS Template 1</SelectItem>
            <SelectItem value="tmpl2">SMS Template 2</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-blue-600 text-white" onClick={handleSend}>
          Send SMS
        </Button>
      </div>
    </div>
  );
}
