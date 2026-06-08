import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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

type SignUpFormProps = {
  invitationId?: string;
  defaultEmail?: string;
};

export function SignUpForm({ invitationId }: SignUpFormProps) {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const { history } = useRouter();

  const signUpSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, { message: t("auth:signUpForm.nameTooShort") }),
        phoneNumber: z
          .string()
          .min(7, { message: t("auth:phoneOtp.invalidPhone") })
          .regex(/^\+?[0-9\s\-().]{7,20}$/, {
            message: t("auth:phoneOtp.invalidPhone"),
          }),
      }),
    [t],
  );

  type SignUpFormValues = z.infer<typeof signUpSchema>;

  const form = useForm<SignUpFormValues>({
    resolver: standardSchemaResolver(signUpSchema),
    defaultValues: {
      name: "",
      phoneNumber: "",
    },
  });

  const onSubmit = async (data: SignUpFormValues) => {
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
        name: data.name,
        ...(invitationId && { invitationId }),
      });
      history.push(`/auth/verify-otp?${searchParams.toString()}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("auth:signUpForm.failedSignUp"),
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  {t("auth:signUpForm.fullName")}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("auth:signUpForm.namePlaceholder")}
                    type="text"
                    autoComplete="name"
                    {...field}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />

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
        </div>

        <Button type="submit" disabled={isPending} className="w-full mt-4">
          {isPending
            ? t("auth:signUpForm.creatingAccount")
            : t("auth:signUpForm.createAccount")}
        </Button>
      </form>
    </Form>
  );
}
