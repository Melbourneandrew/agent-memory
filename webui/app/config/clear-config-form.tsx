"use client";

import { useState } from "react";

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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { clearConfigurationAction } from "./actions";

export function ClearConfigurationForm() {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText.trim() === "CLEAR";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Clear local configuration</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset local configuration?</AlertDialogTitle>
          <AlertDialogDescription>
            Clearing local config removes stored API key and Memory Bank ID for
            this workspace. Type <strong>CLEAR</strong> to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <form action={clearConfigurationAction} className="space-y-4">
          <Input
            name="confirm"
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="Type CLEAR"
            autoComplete="off"
          />
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="submit"
                variant="destructive"
                disabled={!isConfirmed}
              >
                Clear configuration
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
