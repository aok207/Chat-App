import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react";
import { Button } from "../ui/button";
import Spinner from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

type DeleteModalProps = {
  TriggerButton: React.ReactNode;
  handleDelete: () => void;
  content: {
    title: string;
    description: string;
  };
  deleteDisabled: boolean;
};

const DeleteModal = ({
  TriggerButton,
  handleDelete,
  content,
  deleteDisabled,
}: DeleteModalProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{TriggerButton}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="dark:text-white text-black">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription>{content.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            asChild
            className={cn("dark:text-white text-black")}
          >
            <Button variant={"outline"}>Cancel</Button>
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteDisabled}
          >
            {deleteDisabled ? <Spinner /> : "Delete"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteModal;
