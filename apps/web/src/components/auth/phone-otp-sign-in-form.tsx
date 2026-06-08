import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod/v4";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";

type PhoneOtpSignInFormProps = {
  invitationId?: string;
  redirect?: string;
};

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .min(7, { message: "Enter a valid phone number" })
    .regex(/^\+?[0-9\s\-().]{7,20}$/, {
      message: "Enter a valid phone number",
    }),
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

export function PhoneOtpSignInForm({
  invitationId,
  redirect,
}: PhoneOtpSignInFormProps) {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const { history } = useRouter();

  const form = useForm<PhoneFormValues>({
    resolver: standardSchemaResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
  });

  const onSubmit = async (data: PhoneFormValues) => {
    setIsPending(true);
    try {
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: data.phoneNumber,
      });

      if (result.error) {
        toast.error(result.error.message || t("auth:phoneOtp.sendFailed"));
        return;
      }

      toast.success(t("auth:phoneOtp.codeSent"));

      const searchParams = new URLSearchParams({
        phoneNumber: data.phoneNumber,
        ...(invitationId && { invitationId }),
        ...(redirect && { redirect }),
      });
      history.push(`/auth/verify-otp?${searchParams.toString()}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                {t("auth:phoneOtp.phoneNumber")}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder={t("auth:phoneOtp.phonePlaceholder")}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  {...field}
                />
              </FormControl>
              <FormMessage>{fieldState.error?.message}</FormMessage>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending} className="w-full mt-4">
          {isPending ? t("auth:phoneOtp.sending") : t("auth:phoneOtp.sendCode")}
        </Button>
      </form>
    </Form>
  );
}
