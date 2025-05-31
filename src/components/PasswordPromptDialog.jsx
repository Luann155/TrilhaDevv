import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ShieldAlert } from 'lucide-react';

const PasswordPromptDialog = ({ isOpen, onOpenChange, onConfirm, title, description }) => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const correctPassword = "2025";

  const handleConfirm = () => {
    if (password === correctPassword) {
      onConfirm();
      setPassword('');
      onOpenChange(false);
    } else {
      toast({
        title: "Senha Incorreta",
        description: "A senha fornecida está incorreta. Tente novamente.",
        variant: "destructive",
      });
      setPassword('');
    }
  };

  const handleCancel = () => {
    setPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ShieldAlert className="mr-2 h-5 w-5 text-primary" />
            {title || "Confirmação Necessária"}
          </DialogTitle>
          <DialogDescription>
            {description || "Por favor, insira a senha para continuar com esta ação."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password-prompt" className="text-right">
              Senha
            </Label>
            <Input
              id="password-prompt"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
          <Button onClick={handleConfirm}>Confirmar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordPromptDialog;